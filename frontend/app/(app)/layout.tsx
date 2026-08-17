'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ThemeModePanel, ColorModePanel } from '@/components/theme/ThemeSwitcher';

const NAV = [
  { href: '/tasks', label: 'Tasks' },
  { href: '/projects', label: 'Projects' },
];

type OpenPanel = 'theme' | 'color' | null;

function SidebarContent({
  pathname,
  openPanel,
  setOpenPanel,
  onNavigate,
}: {
  pathname: string | null;
  openPanel: OpenPanel;
  setOpenPanel: (v: OpenPanel) => void;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="mb-4 flex items-center gap-2 px-1">
        <div className="h-6 w-6 rounded bg-accent" />
        <span className="text-sm font-medium">Dexter</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
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

      {/* Change Theme — Light/Dark, matches Figma's first menu item */}
      <div className="relative">
        <button
          onClick={() => setOpenPanel(openPanel === 'theme' ? null : 'theme')}
          className="w-full rounded-md px-3 py-1.5 text-left text-sm text-foreground-muted hover:bg-surface-muted"
        >
          Change Theme
        </button>
        {openPanel === 'theme' && (
          <div className="absolute bottom-full left-0 z-20 mb-2">
            <ThemeModePanel />
          </div>
        )}
      </div>

      {/* Color Mode — the 6 accent colors, matches Figma's second menu item */}
      <div className="relative">
        <button
          onClick={() => setOpenPanel(openPanel === 'color' ? null : 'color')}
          className="w-full rounded-md px-3 py-1.5 text-left text-sm text-foreground-muted hover:bg-surface-muted"
        >
          Color Mode
        </button>
        {openPanel === 'color' && (
          <div className="absolute bottom-full left-0 z-20 mb-2">
            <ColorModePanel />
          </div>
        )}
      </div>

      {/* Settings — placeholder for now, no settings page exists yet */}
      <button
        disabled
        title="Not yet implemented"
        className="w-full rounded-md px-3 py-1.5 text-left text-sm text-foreground-muted opacity-50"
      >
        Settings
      </button>

      <Link
        href="/profile"
        onClick={onNavigate}
        className="mt-1 rounded-md px-3 py-1.5 text-sm text-foreground-muted hover:bg-surface-muted"
      >
        Profile
      </Link>
    </>
  );
}

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface text-foreground md:flex">
      {/* Mobile top bar — only visible below md breakpoint */}
      <div className="flex items-center justify-between border-b border-border p-3 md:hidden">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-accent" />
          <span className="text-sm font-medium">Dexter</span>
        </div>
        <button
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open menu"
          className="rounded-md border border-border p-1.5"
        >
          <div className="flex flex-col gap-1">
            <span className="block h-0.5 w-4 bg-foreground" />
            <span className="block h-0.5 w-4 bg-foreground" />
            <span className="block h-0.5 w-4 bg-foreground" />
          </div>
        </button>
      </div>

      {/* Mobile slide-out drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="flex w-64 flex-col border-r border-border bg-surface p-3">
            <SidebarContent
              pathname={pathname}
              openPanel={openPanel}
              setOpenPanel={setOpenPanel}
              onNavigate={() => setMobileNavOpen(false)}
            />
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setMobileNavOpen(false)} />
        </div>
      )}

      {/* Desktop sidebar — always visible at md+ */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border p-3 md:flex">
        <SidebarContent pathname={pathname} openPanel={openPanel} setOpenPanel={setOpenPanel} />
      </aside>

      <main className="flex-1 overflow-x-auto p-4 md:p-6">{children}</main>
    </div>
  );
}