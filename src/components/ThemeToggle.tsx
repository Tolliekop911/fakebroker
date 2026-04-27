import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  variant?: "prop" | "broker";
}

export function ThemeToggle({ variant = "prop" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const accentColor = variant === "prop" ? "bg-primary" : "bg-broker-primary";
  const hoverColor = variant === "prop" ? "hover:bg-primary/10" : "hover:bg-broker-primary/10";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative flex items-center gap-1 rounded-full p-1 transition-all duration-300",
        "bg-muted/50 border border-border/50"
      )}
      aria-label="Toggle theme"
    >
      <span
        className={cn(
          "flex items-center justify-center w-7 h-7 rounded-full transition-all duration-300",
          !isDark && accentColor,
          !isDark && "text-white shadow-lg",
          isDark && "text-muted-foreground",
          isDark && hoverColor
        )}
      >
        <Sun className="w-4 h-4" />
      </span>
      <span
        className={cn(
          "flex items-center justify-center w-7 h-7 rounded-full transition-all duration-300",
          isDark && accentColor,
          isDark && "text-white shadow-lg",
          !isDark && "text-muted-foreground",
          !isDark && hoverColor
        )}
      >
        <Moon className="w-4 h-4" />
      </span>
    </button>
  );
}
