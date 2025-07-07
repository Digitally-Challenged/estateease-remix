import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';

type Theme = 'light' | 'dark';

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

// Helper to get initial theme
function getInitialTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'light';
  }
  
  const savedTheme = localStorage.getItem('theme') as Theme;
  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme;
  }
  
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  return systemTheme;
}

export function ThemeProvider({ children, defaultTheme = 'light' }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Use lazy initial state to avoid hydration mismatch
    if (typeof window !== 'undefined') {
      return getInitialTheme();
    }
    return defaultTheme;
  });
  const [mounted, setMounted] = useState(false);

  // Handle mounting
  useEffect(() => {
    setMounted(true);
    // Re-read theme after mount to ensure consistency
    const currentTheme = getInitialTheme();
    setThemeState(currentTheme);
  }, []);

  // Update DOM and localStorage when theme changes
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      // Also update class for Tailwind dark mode
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme, mounted]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Theme-aware className helper
export function themeClass(lightClass: string, darkClass: string): string {
  return `${lightClass} dark:${darkClass}`;
}