# GalaxyCare — API Service Layer

The UI stays completely independent of the backend. **Components only import from
`src/services/api.js`** and never call `fetch` directly.

## Configure the backend

Add the backend base URL to `frontend/.env`:

```
REACT_APP_API_BASE_URL=https://your-backend-url
```

Restart the dev server after changing `.env`.

- If the URL **is set** → real REST calls hit your backend.
- If the URL **is empty** → every request throws `ApiError` with code `NO_BACKEND`,
  and the UI shows a clean "backend not connected" state (no fake/demo data).

## API used by the UI

### `diagnose({ complaint, device_model, one_ui_version, clarification_answer })`
`POST /diagnose`

Response:
```json
{
  "diagnosis": "...",
  "needs_clarification": false,
  "clarification_question": null,
  "steps": [
    { "id": 1, "title": "...", "description": "...", "risk": "LOW", "can_fix": true }
  ],
  "served_from_cache": true
}
```

### `applyFix({ step_id, device_model, one_ui_version })`
`POST /fix`

Response:
```json
{ "success": true, "message": "Fix applied successfully" }
```

### `getHistory()` / `saveHistory(plan)`
`GET /history` and `POST /history` — used by the Care History drawer.

## Usage

```js
import { diagnose, applyFix } from "../services/api";

const plan = await diagnose({
  complaint: "Battery drains fast",
  device_model: "Samsung Galaxy S24 Ultra",
  one_ui_version: "One UI 6.1 (Android 14)",
});
```

Never import `fetch` logic into components. If the contract changes, edit only
`api.js`.
