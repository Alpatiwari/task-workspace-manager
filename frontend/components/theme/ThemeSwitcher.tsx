'use client';

import { useTheme, AccentTheme } from '@/lib/theme-context';

const ACCENT_OPTIONS: { value: AccentTheme; label: string; swatch: string }[] = [
  { value: 'amber', label: 'Amber', swatch: '#d97706' },
  { value: 'blue', label: 'Blue', swatch: '#4f46e5' },
  { value: 'pink', label: 'Pink', swatch: '#db2777' },
  { value: 'rose', label: 'Rose', swatch: '#e11d48' },
  { value: 'emerald', label: 'Emerald', swatch: '#059669' },
  { value: 'black', label: 'Black', swatch: '#18181b' },
];

// "Change Theme" — Light / Dark only, matching Figma's first menu item.
export function ThemeModePanel() {
  const { colorMode, setColorMode } = useTheme();

  return (
    <div className="w-40 rounded-lg border border-border bg-surface p-2 text-sm shadow-lg">
      {(['light', 'dark'] as const).map((mode) => (
        <button
          key={mode}
          onClick={() => setColorMode(mode)}
          className="flex w-full items-center justify-between rounded-md px-2 py-1.5 capitalize hover:bg-surface-muted"
        >
          {mode}
          {colorMode === mode && <span className="text-accent">✓</span>}
        </button>
      ))}
    </div>
  );
}

// "Color Mode" — the 6 accent colors, matching Figma's second menu item.
export function ColorModePanel() {
  const { accent, setAccent } = useTheme();

  return (
    <div className="w-48 rounded-lg border border-border bg-surface p-2 text-sm shadow-lg">
      {ACCENT_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setAccent(opt.value)}
          className="flex w-full items-center justify-between rounded-md px-2 py-1.5 hover:bg-surface-muted"
        >
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: opt.swatch }} />
            {opt.label}
          </span>
          {accent === opt.value && <span className="text-accent">✓</span>}
        </button>
      ))}
    </div>
  );
}