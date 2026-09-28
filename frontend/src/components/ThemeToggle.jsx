import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = theme === "dark";

  return (
    <button
      data-testid="theme-toggle-button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className="group relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:border-primary/50 hover:text-primary"
    >
      {mounted && isDark ? (
        <Sun className="h-4 w-4 transition-transform group-hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 transition-transform group-hover:-rotate-12" />
      )}
    </button>
  );
};
