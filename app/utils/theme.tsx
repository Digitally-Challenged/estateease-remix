import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

/**
 * ThemeProvider — locked to light mode for local-only use.
 * Dark mode is disabled to avoid dual-system conflicts
 * (CSS variable inversion + Tailwind dark: classes).
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false);
  const theme: Theme = "light";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Ensure DOM is always in light mode
  useEffect(() => {
    if (mounted && typeof window !== "undefined") {
      document.documentElement.removeAttribute("data-theme");
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [mounted]);

  const setTheme = useCallback((_newTheme: Theme) => {
    // no-op: locked to light mode
  }, []);

  const toggleTheme = useCallback(() => {
    // no-op: locked to light mode
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Theme-aware className helper (kept for backwards compat, returns light class only)
export function themeClass(lightClass: string, _darkClass: string): string {
  return lightClass;
}
