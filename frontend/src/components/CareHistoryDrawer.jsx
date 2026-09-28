import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Clock, Smartphone, Trash2, RotateCcw, Inbox } from "lucide-react";

const formatTime = (ts) => {
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

export const CareHistoryDrawer = ({ open, onOpenChange, items, onLoad, onClear }) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        data-testid="care-history-drawer"
        className="w-full overflow-y-auto border-border bg-background sm:max-w-md"
      >
        <SheetHeader className="text-left">
          <SheetTitle className="flex items-center gap-2 font-display">
            <Clock className="h-5 w-5 text-primary" /> Care History
          </SheetTitle>
        </SheetHeader>

        <p className="mt-1 mono-label text-[10px] text-muted-foreground">
          03 / Saved diagnostics
        </p>

        {items.length === 0 ? (
          <div className="mt-16 flex flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
              <Inbox className="h-6 w-6" />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No saved care plans yet. Generate a plan and it will appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-5 space-y-3">
              {items.map((item) => (
                <button
                  key={item.id}
                  data-testid="care-history-item"
                  onClick={() => onLoad(item)}
                  className="group w-full rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="mono-label text-[9px] text-muted-foreground">
                      {formatTime(item.created_at)}
                    </span>
                    <RotateCcw className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-primary" />
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm font-medium text-foreground">
                    {item.diagnosis || item.complaint}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5 mono-label text-[9px] text-muted-foreground">
                    <Smartphone className="h-3 w-3" />
                    {item.device_model} · {item.one_ui_version}
                  </div>
                </button>
              ))}
            </div>

            <button
              data-testid="clear-history-button"
              onClick={onClear}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" /> Clear history
            </button>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
