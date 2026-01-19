"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { useEffect, useState } from "react";

interface ThemeToggleProps {
  variant?: "icon" | "dropdown";
}

/**
 * ThemeToggle - Switch between light, dark, and system themes
 *
 * Features:
 * - Animated icon that reflects current theme
 * - Cycles through: light -> dark -> system
 * - No flash on initial load
 */
export function ThemeToggle({ variant = "icon" }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return placeholder to prevent layout shift
    return (
      <button
        className="p-2 rounded-full bg-muted text-muted-foreground"
        aria-label="Toggle theme"
      >
        <div className="w-5 h-5" />
      </button>
    );
  }

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getIcon = () => {
    if (theme === "system") {
      return <Monitor size={20} />;
    }
    return resolvedTheme === "dark" ? <Moon size={20} /> : <Sun size={20} />;
  };

  const getLabel = () => {
    if (theme === "system") return "System theme";
    return theme === "dark" ? "Dark mode" : "Light mode";
  };

  if (variant === "dropdown") {
    return (
      <div className="relative group">
        <button
          onClick={cycleTheme}
          className="p-2 rounded-full bg-muted hover:bg-muted/80 text-foreground transition-colors"
          aria-label={getLabel()}
          title={getLabel()}
        >
          {getIcon()}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={cycleTheme}
      className="p-2 rounded-full bg-muted hover:bg-muted/80 text-foreground transition-all duration-200"
      aria-label={getLabel()}
      title={getLabel()}
    >
      <span className="block transition-transform duration-200 hover:rotate-12">
        {getIcon()}
      </span>
    </button>
  );
}
