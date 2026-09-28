import { useState } from "react";
import { HelpCircle, Send, Loader2 } from "lucide-react";

const QUICK_ANSWERS = ["Yes", "No", "Not sure", "It started recently"];

export const ClarificationBox = ({ question, onSubmit, loading }) => {
  const [answer, setAnswer] = useState("");

  const submit = (value) => {
    const finalAnswer = (value ?? answer).trim();
    if (!finalAnswer) return;
    onSubmit(finalAnswer);
  };

  return (
    <div
      data-testid="clarification-question-box"
      className="animate-in fade-in slide-in-from-bottom-2 rounded-2xl border-2 border-orange-500/40 bg-orange-500/5 p-6 shadow-sm"
    >
      <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-orange-500" />
        </span>
        <span className="mono-label text-[10px] font-bold">
          Low confidence – need clarification
        </span>
      </div>

      <div className="mt-4 flex items-start gap-3">
        <HelpCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-500" />
        <p className="text-lg font-semibold leading-snug text-foreground">{question}</p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {QUICK_ANSWERS.map((qa) => (
          <button
            key={qa}
            data-testid="clarification-quick-answer-btn"
            disabled={loading}
            onClick={() => submit(qa)}
            className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-orange-500/60 hover:text-orange-600 disabled:opacity-60 dark:hover:text-orange-400"
          >
            {qa}
          </button>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Or type your own answer…"
          className="h-11 flex-1 rounded-xl border-2 border-input bg-background px-4 text-sm outline-none transition-colors focus:border-orange-500"
        />
        <button
          data-testid="clarification-submit-btn"
          onClick={() => submit()}
          disabled={loading || !answer.trim()}
          className="flex h-11 items-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Submit
        </button>
      </div>
    </div>
  );
};
