import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Header } from "./Header";
import { SymptomForm } from "./SymptomForm";
import { CarePlan } from "./CarePlan";
import { CareHistoryDrawer } from "./CareHistoryDrawer";
import {
  diagnose,
  applyFix,
  getHistory,
  saveHistory,
  isBackendConfigured,
} from "@/services/api";

export default function GalaxyCareApp() {
  const [complaint, setComplaint] = useState("");
  const [deviceModel, setDeviceModel] = useState("");
  const [oneUiVersion, setOneUiVersion] = useState("");
  const [errors, setErrors] = useState({});

  const [status, setStatus] = useState("idle"); // idle|understanding|low_confidence|plan_ready|served_from_cache|error
  const [plan, setPlan] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [fixStates, setFixStates] = useState({});
  const [clarifying, setClarifying] = useState(false);
  const [savedToHistory, setSavedToHistory] = useState(false);

  const [history, setHistory] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  const backendOnline = isBackendConfigured();
  const loading = status === "understanding";

  // Load history from backend on mount (silent if unavailable)
  useEffect(() => {
    if (!backendOnline) return;
    getHistory()
      .then((items) => Array.isArray(items) && setHistory(items))
      .catch(() => {});
  }, [backendOnline]);

  const validate = () => {
    const e = {};
    if (!complaint.trim()) e.complaint = "Please describe what you're experiencing.";
    if (!deviceModel) e.deviceModel = "Select your device model.";
    if (!oneUiVersion) e.oneUiVersion = "Select your One UI version.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const runDiagnose = useCallback(
    async (clarificationAnswer) => {
      setStatus("understanding");
      setErrorMessage("");
      setSavedToHistory(false);
      if (!clarificationAnswer) {
        setPlan(null);
        setFixStates({});
      }
      try {
        const result = await diagnose({
          complaint,
          device_model: deviceModel,
          one_ui_version: oneUiVersion,
          clarification_answer: clarificationAnswer || null,
        });
        setPlan(result);

        if (result.needs_clarification) {
          setStatus("low_confidence");
        } else {
          setStatus(result.served_from_cache ? "served_from_cache" : "plan_ready");
          persistToHistory(result);
        }
      } catch (err) {
        setStatus("error");
        setErrorMessage(
          err?.code === "NO_BACKEND"
            ? "No backend connected yet. Set REACT_APP_API_BASE_URL to your backend URL, then try again."
            : err?.message || "Unexpected error. Using safe mode.",
        );
        toast.error(err?.message || "Couldn't reach the server.");
      } finally {
        setClarifying(false);
      }
    },
    [complaint, deviceModel, oneUiVersion],
  );

  const persistToHistory = (result) => {
    const entry = {
      id: `${Date.now()}`,
      created_at: new Date().toISOString(),
      complaint,
      device_model: deviceModel,
      one_ui_version: oneUiVersion,
      diagnosis: result.diagnosis,
      steps: result.steps,
      served_from_cache: result.served_from_cache,
    };
    setHistory((prev) => [entry, ...prev].slice(0, 30));
    setSavedToHistory(true);
    if (backendOnline) saveHistory(entry).catch(() => {});
  };

  const handleAnalyze = () => {
    if (!validate()) return;
    runDiagnose(null);
  };

  const handleClarify = (answer) => {
    setClarifying(true);
    runDiagnose(answer);
  };

  const handleFix = async (step) => {
    setFixStates((s) => ({ ...s, [step.id]: "fixing" }));
    try {
      const res = await applyFix({
        step_id: step.id,
        device_model: deviceModel,
        one_ui_version: oneUiVersion,
      });
      if (res?.success) {
        setFixStates((s) => ({ ...s, [step.id]: "fixed" }));
        toast.success(res.message || "Fix applied successfully");
      } else {
        setFixStates((s) => ({ ...s, [step.id]: "idle" }));
        toast.error(res?.message || "Fix could not be applied.");
      }
    } catch (err) {
      setFixStates((s) => ({ ...s, [step.id]: "idle" }));
      toast.error(err?.message || "Couldn't apply the fix.");
    }
  };

  const loadFromHistory = (item) => {
    setComplaint(item.complaint || "");
    setDeviceModel(item.device_model || "");
    setOneUiVersion(item.one_ui_version || "");
    setPlan({
      diagnosis: item.diagnosis,
      steps: item.steps || [],
      needs_clarification: false,
      clarification_question: null,
      served_from_cache: true,
    });
    setFixStates({});
    setStatus("served_from_cache");
    setSavedToHistory(true);
    setHistoryOpen(false);
  };

  const clearHistory = () => {
    setHistory([]);
    toast.success("Care history cleared");
  };

  return (
    <div className="App min-h-screen bg-background">
      <Header
        historyCount={history.length}
        onOpenHistory={() => setHistoryOpen(true)}
        backendOnline={backendOnline}
      />

      {/* subtle tech grid backdrop */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] tech-grid tech-grid-mask opacity-40" />

      <main className="relative mx-auto max-w-6xl px-5 pb-24 pt-10 sm:px-8 sm:pt-14">
        <div className="mono-label mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[10px] text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Guided device care
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
          <SymptomForm
            complaint={complaint}
            setComplaint={setComplaint}
            deviceModel={deviceModel}
            setDeviceModel={setDeviceModel}
            oneUiVersion={oneUiVersion}
            setOneUiVersion={setOneUiVersion}
            onAnalyze={handleAnalyze}
            loading={loading}
            errors={errors}
          />

          <div className="lg:pt-16">
            <CarePlan
              status={status}
              plan={plan}
              fixStates={fixStates}
              onFix={handleFix}
              onClarify={handleClarify}
              clarifying={clarifying}
              errorMessage={errorMessage}
              savedToHistory={savedToHistory}
            />
          </div>
        </div>
      </main>

      <CareHistoryDrawer
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        items={history}
        onLoad={loadFromHistory}
        onClear={clearHistory}
      />
    </div>
  );
}
