"""Backend regression tests for GalaxyCare API."""
import os
import pytest
import requests
from pathlib import Path

# Load REACT_APP_BACKEND_URL from frontend/.env
_env_file = Path(__file__).resolve().parents[2] / "frontend" / ".env"
if _env_file.exists():
    for line in _env_file.read_text().splitlines():
        if line.startswith("REACT_APP_BACKEND_URL="):
            os.environ.setdefault("REACT_APP_BACKEND_URL", line.split("=", 1)[1].strip())

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def clean_history():
    requests.delete(f"{API}/history", timeout=15)
    yield
    requests.delete(f"{API}/history", timeout=15)


def test_root():
    r = requests.get(f"{API}/", timeout=15)
    assert r.status_code == 200


def test_diagnose_validation_empty_complaint():
    r = requests.post(f"{API}/diagnose", json={
        "complaint": "", "device_model": "Samsung Galaxy S24 Ultra",
        "one_ui_version": "One UI 6.1 (Android 14)"
    }, timeout=15)
    assert r.status_code == 400


def test_diagnose_full_plan_and_cache():
    payload = {
        "complaint": "battery drains super fast even overnight",
        "device_model": "Samsung Galaxy S24 Ultra",
        "one_ui_version": "One UI 6.1 (Android 14)",
    }
    r = requests.post(f"{API}/diagnose", json=payload, timeout=60)
    assert r.status_code == 200
    data = r.json()
    assert data["needs_clarification"] is False
    assert isinstance(data["diagnosis"], str) and len(data["diagnosis"]) > 5
    risks = {s["risk"] for s in data["steps"]}
    assert {"LOW", "MEDIUM", "HIGH"}.issubset(risks)
    # can_fix on LOW
    lows = [s for s in data["steps"] if s["risk"] == "LOW"]
    assert any(s["can_fix"] for s in lows)
    # Second call cached
    r2 = requests.post(f"{API}/diagnose", json=payload, timeout=60)
    assert r2.status_code == 200
    assert r2.json()["served_from_cache"] is True


def test_diagnose_vague_clarification():
    r = requests.post(f"{API}/diagnose", json={
        "complaint": "broken",
        "device_model": "Samsung Galaxy S24 Ultra",
        "one_ui_version": "One UI 6.1 (Android 14)",
    }, timeout=60)
    assert r.status_code == 200
    data = r.json()
    # LLM may either request clarification OR provide generic plan; both acceptable
    if data["needs_clarification"]:
        assert data["clarification_question"]
        assert data["steps"] == []


def test_fix_success():
    r = requests.post(f"{API}/fix", json={
        "step_id": 1, "device_model": "Samsung Galaxy S24 Ultra",
        "one_ui_version": "One UI 6.1 (Android 14)"
    }, timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert d["success"] is True
    assert "success" in d["message"].lower()


def test_history_crud(clean_history):
    # save
    entry = {
        "complaint": "TEST_battery drain",
        "device_model": "Samsung Galaxy S24 Ultra",
        "one_ui_version": "One UI 6.1 (Android 14)",
        "diagnosis": "TEST",
        "steps": [{"id": 1, "title": "t", "description": "d", "risk": "LOW", "can_fix": True}],
        "served_from_cache": False,
    }
    r = requests.post(f"{API}/history", json=entry, timeout=15)
    assert r.status_code == 200
    saved = r.json()
    assert saved["complaint"] == "TEST_battery drain"

    # list
    r2 = requests.get(f"{API}/history", timeout=15)
    assert r2.status_code == 200
    lst = r2.json()
    assert any(e["id"] == saved["id"] for e in lst)

    # delete
    r3 = requests.delete(f"{API}/history", timeout=15)
    assert r3.status_code == 200
    r4 = requests.get(f"{API}/history", timeout=15)
    assert r4.json() == []
