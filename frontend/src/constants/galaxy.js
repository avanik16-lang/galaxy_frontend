export const DEVICE_MODELS = [
  "Samsung Galaxy S24 Ultra",
  "Samsung Galaxy S24+",
  "Samsung Galaxy S24",
  "Samsung Galaxy S23 Ultra",
  "Samsung Galaxy S23+",
  "Samsung Galaxy S23 FE",
  "Samsung Galaxy Z Fold 5",
  "Samsung Galaxy Z Flip 5",
  "Samsung Galaxy A55 5G",
  "Samsung Galaxy A35 5G",
  "Samsung Galaxy Tab S9 Ultra",
];

export const ONE_UI_VERSIONS = [
  "One UI 6.1.1 (Android 14)",
  "One UI 6.1 (Android 14)",
  "One UI 6.0 (Android 14)",
  "One UI 5.1 (Android 13)",
  "One UI 5.0 (Android 13)",
];

export const RISK_STYLES = {
  LOW: {
    label: "LOW RISK",
    badge:
      "bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  MEDIUM: {
    label: "MEDIUM RISK",
    badge:
      "bg-amber-500/10 border-amber-500/40 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  HIGH: {
    label: "HIGH RISK",
    badge:
      "bg-rose-500/10 border-rose-500/40 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
    dot: "bg-rose-500",
  },
};

export const STATUS = {
  idle: null,
  understanding: {
    label: "Understanding your issue…",
    tone: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
    spin: true,
  },
  low_confidence: {
    label: "Low confidence – need clarification",
    tone: "text-orange-600 dark:text-orange-400",
    dot: "bg-orange-500",
    pulse: true,
  },
  plan_ready: {
    label: "Plan ready",
    tone: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  served_from_cache: {
    label: "Served from cache",
    tone: "text-cyan-600 dark:text-cyan-400",
    dot: "bg-cyan-500",
  },
  error: {
    label: "Something went wrong",
    tone: "text-rose-600 dark:text-rose-400",
    dot: "bg-rose-500",
  },
};
