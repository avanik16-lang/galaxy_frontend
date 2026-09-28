from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import re
import json
import hashlib
import logging
import uuid
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone

from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

app = FastAPI(title="GalaxyCare API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("galaxycare")


# ----------------------------- Models -----------------------------
class Step(BaseModel):
    id: int
    title: str
    description: str
    risk: str  # LOW | MEDIUM | HIGH
    can_fix: bool


class DiagnoseRequest(BaseModel):
    complaint: str
    device_model: str
    one_ui_version: str
    clarification_answer: Optional[str] = None


class DiagnoseResponse(BaseModel):
    diagnosis: str
    needs_clarification: bool = False
    clarification_question: Optional[str] = None
    steps: List[Step] = []
    served_from_cache: bool = False


class FixRequest(BaseModel):
    step_id: int
    device_model: str
    one_ui_version: str


class FixResponse(BaseModel):
    success: bool
    message: str


class HistoryEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    complaint: str = ""
    device_model: str = ""
    one_ui_version: str = ""
    diagnosis: str = ""
    steps: List[Step] = []
    served_from_cache: bool = False


# ----------------------------- Helpers -----------------------------
def _cache_key(req: DiagnoseRequest) -> str:
    raw = f"{req.complaint.strip().lower()}|{req.device_model}|{req.one_ui_version}|{(req.clarification_answer or '').strip().lower()}"
    return hashlib.sha256(raw.encode()).hexdigest()


def _extract_json(text: str) -> dict:
    text = text.strip()
    fence = re.search(r"```(?:json)?\s*(\{.*\})\s*```", text, re.DOTALL)
    if fence:
        text = fence.group(1)
    else:
        brace = re.search(r"\{.*\}", text, re.DOTALL)
        if brace:
            text = brace.group(0)
    return json.loads(text)


SYSTEM_PROMPT = (
    "You are GalaxyCare, a Samsung Galaxy / One UI device troubleshooting engine. "
    "Given a user's complaint, device model and One UI version, produce a safe, ordered care plan.\n"
    "Respond with ONLY valid minified JSON, no markdown, matching exactly this schema:\n"
    '{"diagnosis": string, "needs_clarification": boolean, "clarification_question": string|null, '
    '"steps": [{"id": number, "title": string, "description": string, "risk": "LOW"|"MEDIUM"|"HIGH", "can_fix": boolean}]}\n'
    "Rules:\n"
    "- diagnosis: one clear friendly sentence explaining the likely cause.\n"
    "- If the complaint is too vague to act on AND no clarification answer was given, set needs_clarification=true, "
    "provide a single clarification_question, and return an empty steps array.\n"
    "- Otherwise needs_clarification=false, clarification_question=null, and return 3 to 5 ordered steps.\n"
    "- Steps must be ordered from safest/simplest to most involved.\n"
    "- You MUST include at least one LOW risk step, at least one MEDIUM risk step, and at least one HIGH risk step.\n"
    "- LOW risk steps that can be applied automatically for the user (toggles, settings) set can_fix=true.\n"
    "- MEDIUM and HIGH risk steps set can_fix=false (they require manual user action).\n"
    "- id starts at 1 and increments."
)


def _fallback_plan(req: DiagnoseRequest) -> dict:
    c = req.complaint.lower()
    if "batter" in c or "drain" in c or "charge" in c:
        topic, diag = "battery", "Your battery settings may be working harder than they need to."
        steps = [
            ("Check battery usage", "See which apps have been active in the background and pause anything unexpected.", "LOW", True),
            ("Turn on Adaptive battery", "One UI can learn your routine and reduce power use for apps you rarely open.", "LOW", True),
            ("Clear cache partition", "Recovery-mode cache wipe can clear corrupt temp data after an update.", "MEDIUM", False),
            ("Factory reset the device", "A full reset removes stubborn software faults after backing up your data.", "HIGH", False),
        ]
    elif "wifi" in c or "wi-fi" in c or "network" in c or "connect" in c:
        topic, diag = "connectivity", "Your Wi-Fi profile or radio state is likely causing the drops."
        steps = [
            ("Toggle Airplane mode", "Turning it on and off refreshes the radios and often restores a stable connection.", "LOW", True),
            ("Forget and rejoin the network", "Removing the saved network clears a bad stored profile before reconnecting.", "LOW", True),
            ("Reset network settings", "This clears Wi-Fi, mobile and Bluetooth settings back to defaults.", "MEDIUM", False),
            ("Update or reflash firmware", "A One UI firmware repair via Smart Switch fixes deeper radio issues.", "HIGH", False),
        ]
    else:
        topic, diag = "general", "This looks like a software state issue we can work through step by step."
        steps = [
            ("Restart your device", "A clean restart clears temporary glitches that build up over time.", "LOW", True),
            ("Check for a One UI update", "Installing the latest patch can resolve known bugs on your version.", "LOW", True),
            ("Boot into Safe Mode", "Safe Mode helps confirm whether a downloaded app is the cause.", "MEDIUM", False),
            ("Factory reset the device", "A full reset clears persistent faults after you back up your data.", "HIGH", False),
        ]
    return {
        "diagnosis": diag,
        "needs_clarification": False,
        "clarification_question": None,
        "steps": [
            {"id": i + 1, "title": t, "description": d, "risk": r, "can_fix": f}
            for i, (t, d, r, f) in enumerate(steps)
        ],
    }


def _normalize(data: dict, req: DiagnoseRequest) -> dict:
    """Validate LLM output; fall back for missing pieces and guarantee risk coverage."""
    if data.get("needs_clarification"):
        return {
            "diagnosis": data.get("diagnosis", "I need a little more detail to help."),
            "needs_clarification": True,
            "clarification_question": data.get("clarification_question")
            or "Could you tell me a bit more about when this happens?",
            "steps": [],
        }

    steps = data.get("steps") or []
    clean = []
    for i, s in enumerate(steps):
        risk = str(s.get("risk", "LOW")).upper()
        if risk not in ("LOW", "MEDIUM", "HIGH"):
            risk = "LOW"
        clean.append({
            "id": int(s.get("id", i + 1)),
            "title": str(s.get("title", f"Step {i + 1}")),
            "description": str(s.get("description", "")),
            "risk": risk,
            "can_fix": bool(s.get("can_fix", risk == "LOW")),
        })

    risks = {s["risk"] for s in clean}
    if not clean or not {"LOW", "MEDIUM", "HIGH"}.issubset(risks):
        # Guarantee full risk coverage by merging with the deterministic plan.
        fb = _fallback_plan(req)["steps"]
        have = risks
        for s in fb:
            if s["risk"] not in have:
                clean.append(s)
                have.add(s["risk"])
        clean = clean[:5]
        for idx, s in enumerate(clean):
            s["id"] = idx + 1

    return {
        "diagnosis": data.get("diagnosis", "Here is a care plan for your device."),
        "needs_clarification": False,
        "clarification_question": None,
        "steps": clean,
    }


async def _generate_plan(req: DiagnoseRequest) -> dict:
    if not EMERGENT_LLM_KEY:
        return _fallback_plan(req)
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"diagnose-{_cache_key(req)[:16]}",
            system_message=SYSTEM_PROMPT,
        ).with_model("openai", "gpt-5.4")

        prompt = (
            f"Device: {req.device_model}\n"
            f"One UI version: {req.one_ui_version}\n"
            f"Complaint: {req.complaint}\n"
        )
        if req.clarification_answer:
            prompt += f"Clarification answer: {req.clarification_answer}\n"

        response = await chat.send_message(UserMessage(text=prompt))
        data = _extract_json(response if isinstance(response, str) else str(response))
        return _normalize(data, req)
    except Exception as e:
        logger.exception("LLM diagnose failed, using fallback: %s", e)
        return _fallback_plan(req)


# ----------------------------- Routes -----------------------------
@api_router.get("/")
async def root():
    return {"message": "GalaxyCare API online"}


@api_router.post("/diagnose", response_model=DiagnoseResponse)
async def diagnose(req: DiagnoseRequest):
    if not req.complaint.strip():
        raise HTTPException(status_code=400, detail="Complaint is required.")
    if not req.device_model or not req.one_ui_version:
        raise HTTPException(status_code=400, detail="Device model and One UI version are required.")

    key = _cache_key(req)
    cached = await db.diagnoses_cache.find_one({"_id": key})
    if cached:
        return DiagnoseResponse(
            diagnosis=cached["diagnosis"],
            needs_clarification=cached.get("needs_clarification", False),
            clarification_question=cached.get("clarification_question"),
            steps=cached.get("steps", []),
            served_from_cache=True,
        )

    plan = await _generate_plan(req)

    # Only cache actionable plans (not clarification requests)
    if not plan["needs_clarification"]:
        await db.diagnoses_cache.update_one(
            {"_id": key},
            {"$set": {**plan, "created_at": datetime.now(timezone.utc).isoformat()}},
            upsert=True,
        )

    return DiagnoseResponse(**plan, served_from_cache=False)


@api_router.post("/fix", response_model=FixResponse)
async def fix(req: FixRequest):
    await db.applied_fixes.insert_one({
        "step_id": req.step_id,
        "device_model": req.device_model,
        "one_ui_version": req.one_ui_version,
        "applied_at": datetime.now(timezone.utc).isoformat(),
    })
    return FixResponse(success=True, message="Fix applied successfully")


@api_router.get("/history", response_model=List[HistoryEntry])
async def get_history():
    docs = await db.care_history.find({}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return [HistoryEntry(**d) for d in docs]


@api_router.post("/history", response_model=HistoryEntry)
async def save_history(entry: HistoryEntry):
    doc = entry.model_dump()
    await db.care_history.update_one({"id": entry.id}, {"$set": doc}, upsert=True)
    return entry


@api_router.delete("/history")
async def clear_history():
    await db.care_history.delete_many({})
    return {"success": True}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
