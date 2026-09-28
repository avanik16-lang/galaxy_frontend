import { ShieldCheck, History } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export const Header = ({ historyCount, onOpenHistory, backendOnline }) => {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/30">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-lg font-extrabold tracking-tight text-foreground">
              GalaxyCare
            </span>
            <span className="hidden text-muted-foreground sm:inline">/</span>
            <span className="hidden mono-label text-[10px] text-muted-foreground sm:inline">
              One UI Support
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div
            data-testid="diagnostics-ready-dot"
            className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 sm:flex"
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  backendOnline ? "animate-ping bg-emerald-400" : "bg-amber-400"
                }`}
              />
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  backendOnline ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
            </span>
            <span className="mono-label text-[10px] text-muted-foreground">
              {backendOnline ? "Diagnostics ready" : "Backend not connected"}
            </span>
          </div>

          <button
            data-testid="care-history-button"
            onClick={onOpenHistory}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
                {historyCount}
              </span>
            )}
          </button>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
