import { Activity, Bookmark } from "lucide-react";
import { StatusIndicator } from "./StatusIndicator";
import { ClarificationBox } from "./ClarificationBox";
import { CareStep } from "./CareStep";

const EmptyPlan = () => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
      <Activity className="h-6 w-6" />
    </div>
    <p className="mt-4 mono-label text-[10px] text-muted-foreground">Plan waiting</p>
    <p className="mt-2 max-w-xs text-sm text-muted-foreground">
      Describe your symptom and run the diagnostic engine to generate a care plan.
    </p>
  </div>
);

export const CarePlan = ({
  status,
  plan,
  fixStates,
  onFix,
  onClarify,
  clarifying,
  errorMessage,
  savedToHistory,
}) => {
  const hasSteps = plan && plan.steps && plan.steps.length > 0;
  const total = hasSteps ? plan.steps.length : 0;
  const completed = hasSteps
    ? plan.steps.filter((s) => fixStates[s.id] === "fixed").length
    : 0;
  const pct = total ? Math.round((completed / total) * 100) : 0;

  return (
    <section data-testid="care-plan-section" className="relative">
      <div className="flex items-center justify-between">
        <p className="mono-label text-xs font-bold text-primary">02 / Your care plan</p>
        <StatusIndicator status={status} />
      </div>

      <div className="mt-4">
        {status === "error" ? (
          <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-6 text-center">
            <p className="mono-label text-[10px] font-bold text-destructive">
              Couldn&apos;t reach the server
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{errorMessage}</p>
          </div>
        ) : plan && plan.needs_clarification ? (
          <ClarificationBox
            question={plan.clarification_question}
            onSubmit={onClarify}
            loading={clarifying}
          />
        ) : hasSteps ? (
          <div className="space-y-4">
            {/* Diagnosis summary */}
            <div
              data-testid="diagnosis-text-card"
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="mono-label text-[10px] text-muted-foreground">
                  Diagnostic assessment
                </p>
                {savedToHistory && (
                  <span className="flex items-center gap-1.5 mono-label text-[9px] text-emerald-600 dark:text-emerald-400">
                    <Bookmark className="h-3 w-3" /> Saved to history
                  </span>
                )}
              </div>
              <p className="mt-3 font-display text-2xl font-bold leading-snug tracking-tight text-foreground sm:text-3xl">
                {plan.diagnosis}
              </p>

              {/* Progress */}
              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <span
                    data-testid="progress-counter-badge"
                    className="mono-label text-[10px] text-muted-foreground"
                  >
                    {completed} of {total} fixes completed
                  </span>
                  <span className="mono-label text-[10px] text-primary">{pct}%</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className="flex items-center gap-2 pt-1">
              <span className="mono-label text-[10px] text-muted-foreground">
                {total} recommended steps
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>

            {plan.steps.map((step, i) => (
              <CareStep
                key={step.id}
                step={step}
                index={i}
                fixState={fixStates[step.id]}
                onFix={onFix}
              />
            ))}
          </div>
        ) : (
          <EmptyPlan />
        )}
      </div>
    </section>
  );
};
