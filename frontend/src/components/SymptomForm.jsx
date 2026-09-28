import { Smartphone, Cpu, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEVICE_MODELS, ONE_UI_VERSIONS } from "@/constants/galaxy";

export const SymptomForm = ({
  complaint,
  setComplaint,
  deviceModel,
  setDeviceModel,
  oneUiVersion,
  setOneUiVersion,
  onAnalyze,
  loading,
  errors,
}) => {
  return (
    <section className="relative">
      <p className="mono-label text-xs font-bold text-primary">
        01 / Tell us what&apos;s wrong
      </p>
      <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
        Let&apos;s get your
        <br />
        <span className="text-primary">Galaxy back.</span>
      </h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
        Describe what&apos;s happening. We&apos;ll turn it into a clear, safe path
        forward — with risk-rated steps and one-tap fixes.
      </p>

      <div className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
        {/* Symptom — the hero input */}
        <label
          htmlFor="symptom"
          className="mono-label text-[10px] text-muted-foreground"
        >
          What are you experiencing?
        </label>
        <Textarea
          id="symptom"
          data-testid="symptom-textarea"
          value={complaint}
          onChange={(e) => setComplaint(e.target.value)}
          rows={5}
          placeholder="e.g. My battery drains quickly after the One UI 6.1 update, screen flickers at 120Hz, or Wi-Fi keeps dropping during calls…"
          className={`mt-2 min-h-[140px] resize-none rounded-xl border-2 bg-background px-4 py-3.5 text-base leading-relaxed transition-colors focus-visible:ring-2 focus-visible:ring-primary/40 ${
            errors.complaint ? "border-destructive" : "border-input focus-visible:border-primary"
          }`}
        />
        {errors.complaint && (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-destructive">
            <AlertCircle className="h-3.5 w-3.5" /> {errors.complaint}
          </p>
        )}

        {/* Device + One UI selects */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mono-label flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Smartphone className="h-3 w-3" /> Device Model <span className="text-primary">*</span>
            </label>
            <Select value={deviceModel} onValueChange={setDeviceModel}>
              <SelectTrigger
                data-testid="device-model-select"
                className={`mt-2 h-11 rounded-xl border-2 bg-background text-sm ${
                  errors.deviceModel ? "border-destructive" : "border-input"
                }`}
              >
                <SelectValue placeholder="Select Galaxy model…" />
              </SelectTrigger>
              <SelectContent>
                {DEVICE_MODELS.map((m) => (
                  <SelectItem key={m} value={m} data-testid={`device-option-${m}`}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.deviceModel && (
              <p className="mt-1.5 text-xs text-destructive">{errors.deviceModel}</p>
            )}
          </div>

          <div>
            <label className="mono-label flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Cpu className="h-3 w-3" /> One UI Version <span className="text-primary">*</span>
            </label>
            <Select value={oneUiVersion} onValueChange={setOneUiVersion}>
              <SelectTrigger
                data-testid="oneui-version-select"
                className={`mt-2 h-11 rounded-xl border-2 bg-background text-sm ${
                  errors.oneUiVersion ? "border-destructive" : "border-input"
                }`}
              >
                <SelectValue placeholder="Select One UI version…" />
              </SelectTrigger>
              <SelectContent>
                {ONE_UI_VERSIONS.map((v) => (
                  <SelectItem key={v} value={v} data-testid={`oneui-option-${v}`}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.oneUiVersion && (
              <p className="mt-1.5 text-xs text-destructive">{errors.oneUiVersion}</p>
            )}
          </div>
        </div>

        {/* Analyze button */}
        <button
          data-testid="get-care-plan-button"
          onClick={() => onAnalyze()}
          disabled={loading}
          className="group mt-6 flex w-full items-center justify-center gap-2.5 rounded-xl bg-primary px-6 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Understanding your issue…
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 transition-transform group-hover:scale-110" />
              Get Care Plan
            </>
          )}
        </button>
        <p className="mt-2 text-center mono-label text-[10px] text-muted-foreground">
          Analyze with Galaxy Diagnostic Engine
        </p>
      </div>
    </section>
  );
};
