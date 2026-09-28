/**
 * GalaxyCare API service layer.
 *
 * This is the ONLY file the UI should import for backend communication.
 * UI components must never call `fetch` directly.
 *
 * Configure the backend base URL via an environment variable:
 *   REACT_APP_API_BASE_URL=https://your-backend-url
 *
 * If no base URL is configured, every request throws an ApiError with
 * code "NO_BACKEND" so the UI can show a clean "not connected" state.
 * There is intentionally NO mock/demo data here — real backend only.
 */

const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message, code, status) {
    super(message);
    this.name = "ApiError";
    this.code = code || "REQUEST_FAILED";
    this.status = status || null;
  }
}

/** Whether a backend has been configured via env. */
export function isBackendConfigured() {
  return Boolean(API_BASE_URL);
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

async function request(method, path, body) {
  if (!API_BASE_URL) {
    throw new ApiError(
      "Backend not configured. Set REACT_APP_API_BASE_URL to your backend URL.",
      "NO_BACKEND"
    );
  }

  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new ApiError(
      "Couldn't reach the server. Check your connection or backend URL.",
      "NETWORK",
    );
  }

  if (!res.ok) {
    let detail = "";
    try {
      const data = await res.json();
      detail = data?.detail || data?.message || "";
    } catch (_) {
      /* ignore parse errors */
    }
    throw new ApiError(
      detail || `Request failed with status ${res.status}`,
      "HTTP_ERROR",
      res.status,
    );
  }

  if (res.status === 204) return null;
  return res.json();
}

/**
 * POST /diagnose
 * @param {{complaint:string, device_model:string, one_ui_version:string, clarification_answer?:string|null}} payload
 * @returns {Promise<{diagnosis:string, needs_clarification:boolean, clarification_question:string|null, steps:Array, served_from_cache:boolean}>}
 */
export function diagnose({ complaint, device_model, one_ui_version, clarification_answer = null }) {
  return request("POST", "/diagnose", {
    complaint,
    device_model,
    one_ui_version,
    clarification_answer,
  });
}

/**
 * POST /fix
 * @param {{step_id:number, device_model:string, one_ui_version:string}} payload
 * @returns {Promise<{success:boolean, message:string}>}
 */
export function applyFix({ step_id, device_model, one_ui_version }) {
  return request("POST", "/fix", { step_id, device_model, one_ui_version });
}

/**
 * GET /history — list saved care plans.
 * @returns {Promise<Array>}
 */
export function getHistory() {
  return request("GET", "/history");
}

/**
 * POST /history — persist a care plan.
 * @param {object} plan
 */
export function saveHistory(plan) {
  return request("POST", "/history", plan);
}
