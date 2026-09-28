import { Wrench, Check, Loader2, Hand } from "lucide-react";
import { RISK_STYLES } from "@/constants/galaxy";

export const CareStep = ({ step, index, fixState, onFix }) => {
  const risk = RISK_STYLES[step.risk] || RISK_STYLES.LOW;
  const showFixButton = step.can_fix && step.risk === "LOW";
  const fixed = fixState === "fixed";
  const fixing = fixState === "fixing";

  return (
    <div
      data-testid={`care-step-item-${step.id}`}
      className={`relative rounded-2xl border bg-card p-5 shadow-sm transition-all ${
        fixed ? "border-emerald-500/40" : "border-border hover:border-primary/30"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-background mono-label text-[10px] font-bold text-muted-foreground">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">
              {step.title}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {step.description}
            </p>
          </div>
        </div>
        <span
          data-testid="risk-tag-badge"
          className={`flex flex-shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1 mono-label text-[9px] font-bold ${risk.badge}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${risk.dot}`} />
          {risk.label}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between pl-11">
        {showFixButton ? (
          fixed ? (
            <span className="flex items-center gap-2 mono-label text-[11px] text-emerald-600 dark:text-emerald-400">
              <Check className="h-4 w-4" /> Fix applied successfully
            </span>
          ) : (
            <button
              data-testid={`fix-for-me-button-${step.id}`}
              onClick={() => onFix(step)}
              disabled={fixing}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/25 transition-all hover:brightness-110 active:scale-95 disabled:opacity-70"
            >
              {fixing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Fixing…
                </>
              ) : (
                <>
                  <Wrench className="h-4 w-4" /> Fix for me
                </>
              )}
            </button>
          )
        ) : (
          <span className="flex items-center gap-2 mono-label text-[10px] text-muted-foreground">
            <Hand className="h-3.5 w-3.5" /> Manual step — do this yourself
          </span>
        )}
      </div>
    </div>
  );
};
