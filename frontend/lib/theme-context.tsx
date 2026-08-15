'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type ColorMode = 'light' | 'dark';
export type AccentTheme = 'amber' | 'blue' | 'pink' | 'rose' | 'emerald' | 'black';

interface ThemeContextValue {
  colorMode: ColorMode;
  accent: AccentTheme;
  setColorMode: (mode: ColorMode) => void;
  setAccent: (accent: AccentTheme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'ablespace-theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [colorMode, setColorModeState] = useState<ColorMode>('light');
  const [accent, setAccentState] = useState<AccentTheme>('blue');
  const [hydrated, setHydrated] = useState(false);

  // Read persisted preference on mount (client-only — localStorage isn't available during SSR).
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.colorMode) setColorModeState(parsed.colorMode);
        if (parsed.accent) setAccentState(parsed.accent);
      } catch {
        /* ignore corrupt storage */
      }
    }
    setHydrated(true);
  }, []);

  // Apply to <html> and persist whenever either value changes.
  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    root.classList.toggle('dark', colorMode === 'dark');
    root.setAttribute('data-theme', accent);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ colorMode, accent }));
  }, [colorMode, accent, hydrated]);

  return (
    <ThemeContext.Provider
      value={{
        colorMode,
        accent,
        setColorMode: setColorModeState,
        setAccent: setAccentState,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
