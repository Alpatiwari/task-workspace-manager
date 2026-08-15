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

export function ThemeSwitcher() {
  const { colorMode, accent, setColorMode, setAccent } = useTheme();

  return (
    <div className="w-56 rounded-lg border border-border bg-surface p-3 text-sm shadow-lg">
      <p className="mb-2 px-1 text-xs font-medium text-foreground-muted">Color Mode</p>
      <div className="mb-3 flex gap-2">
        {(['light', 'dark'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setColorMode(mode)}
            className={`flex-1 rounded-md border px-2 py-1.5 capitalize transition ${
              colorMode === mode
                ? 'border-accent bg-accent-muted text-accent'
                : 'border-border text-foreground-muted hover:bg-surface-muted'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      <p className="mb-2 px-1 text-xs font-medium text-foreground-muted">Theme</p>
      <div className="flex flex-col gap-1">
        {ACCENT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setAccent(opt.value)}
            className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-surface-muted"
          >
            <span className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: opt.swatch }}
              />
              {opt.label}
            </span>
            {accent === opt.value && <span className="text-accent">✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
