'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher';

const NAV = [
  { href: '/tasks', label: 'Tasks' },
  { href: '/projects', label: 'Projects' },
];

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [themeOpen, setThemeOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface text-foreground">
      <aside className="flex w-56 flex-col border-r border-border p-3">
        <div className="mb-4 flex items-center gap-2 px-1">
          <div className="h-6 w-6 rounded bg-accent" />
          <span className="text-sm font-medium">Dexter</span>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-1.5 text-sm transition ${
                pathname?.startsWith(item.href)
                  ? 'bg-accent-muted text-accent'
                  : 'text-foreground-muted hover:bg-surface-muted'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="relative">
          <button
            onClick={() => setThemeOpen((v) => !v)}
            className="w-full rounded-md px-3 py-1.5 text-left text-sm text-foreground-muted hover:bg-surface-muted"
          >
            Change Theme
          </button>
          {themeOpen && (
            <div className="absolute bottom-full left-0 mb-2">
              <ThemeSwitcher />
            </div>
          )}
        </div>

        <Link
          href="/profile"
          className="mt-1 rounded-md px-3 py-1.5 text-sm text-foreground-muted hover:bg-surface-muted"
        >
          Profile
        </Link>
      </aside>

      <main className="flex-1 overflow-x-auto p-6">{children}</main>
    </div>
  );
}
