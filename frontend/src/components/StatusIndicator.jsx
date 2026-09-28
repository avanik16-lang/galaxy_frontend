import { Loader2 } from "lucide-react";
import { STATUS } from "@/constants/galaxy";

export const StatusIndicator = ({ status }) => {
  const cfg = STATUS[status];
  if (!cfg) return null;

  return (
    <div
      data-testid="status-indicator-badge"
      className={`inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 mono-label text-[10px] ${cfg.tone}`}
    >
      {cfg.spin ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <span className="relative flex h-2 w-2">
          {cfg.pulse && (
            <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${cfg.dot}`} />
          )}
          <span className={`relative inline-flex h-2 w-2 rounded-full ${cfg.dot}`} />
        </span>
      )}
      <span>{cfg.label}</span>
    </div>
  );
};
