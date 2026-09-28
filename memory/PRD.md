# GalaxyCare — One UI Support (Frontend)

## Original Problem Statement
Prepare a Samsung "GalaxyCare" One UI troubleshooting frontend for integration with an
external backend via REST APIs. Keep a clean, separate API/service layer; UI must stay
independent of the API implementation. Backend URL via env var (`REACT_APP_API_BASE_URL`),
no hard-coded localhost. User's final instruction: **no demo/mock data** — real backend only,
to be connected later. Match the "techy/greeky" Samsung aesthetic from provided screenshots.

## User Choices
- Frontend + clean API service layer only (no working backend built)
- Diagnoses would be AI-powered (when backend is later built)
- Light + Dark theme toggle (default dark)
- Care History routed through the API layer (backend), with in-session fallback

## Architecture
- React 19 (CRA + craco), Tailwind, shadcn/ui, next-themes, sonner, lucide-react
- API layer: `src/services/api.js` — the ONLY file UI imports for network calls
  - `diagnose()` → POST /diagnose
  - `applyFix()` → POST /fix
  - `getHistory()` / `saveHistory()` → GET/POST /history
  - No mock data; throws `ApiError(NO_BACKEND)` when `REACT_APP_API_BASE_URL` is empty
- UI components (all in `src/components/`): GalaxyCareApp, Header, SymptomForm,
  StatusIndicator, ClarificationBox, CareStep, CarePlan, CareHistoryDrawer, ThemeToggle
- Constants in `src/constants/galaxy.js` (device models, One UI versions, risk styles, status map)

## Implemented (2026-06)
- Prominent symptom textarea + required Device Model & One UI Version selects with inline validation
- "Get Care Plan" analyze button with loading ("Understanding your issue…") state
- Status indicators: understanding / low confidence / plan ready / served from cache / error
- Clarification flow (needs_clarification) with quick-answer pills + custom answer
- Ordered care steps with LOW/MEDIUM/HIGH risk tags; "Fix for me" on low-risk can_fix steps
  with Fixing…→Fixed states; manual-step note for medium/high
- Progress counter "X of Y fixes completed" + animated bar
- Care History drawer (save & revisit plans, load into plan view, clear)
- Light/Dark theme toggle; Samsung cobalt-blue techy aesthetic, monospace section labels
- Graceful "backend not connected" states (no demo data)

## Backlog / Remaining
- P0: Connect external backend (`REACT_APP_API_BASE_URL`) implementing /diagnose, /fix, /history
- P1: Backend-persisted history across devices (currently session state + optional backend POST)
- P2: HIGH-risk example coverage validation once backend returns live data
