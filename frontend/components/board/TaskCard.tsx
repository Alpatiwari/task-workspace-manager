'use client';

import Link from 'next/link';
import { formatLabel } from '@/lib/format';

const PRIORITY_COLOR: Record<string, string> = {
  URGENT: '#dc2626',
  HIGH: '#f97316',
  MEDIUM: '#f59e0b',
  LOW: '#9ca3af',
  NO_PRIORITY: '#d1d5db',
};

export function TaskCard({ task }: { task: any }) {
  return (
    <Link
      href={`/tasks/${task.id}`}
      className="block rounded-lg border border-border bg-surface p-3 text-sm shadow-sm transition hover:border-accent"
    >
      <p className="font-medium">{task.title}</p>

      <div className="mt-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs text-foreground-muted">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: PRIORITY_COLOR[task.priority] || PRIORITY_COLOR.NO_PRIORITY }}
          />
          {formatLabel(task.priority || 'NO_PRIORITY')}
        </span>
        {task.dueDate && (
          <span className="text-xs text-foreground-muted">
            {new Date(task.dueDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
          </span>
        )}
      </div>

      {task.members?.length > 0 && (
        <div className="mt-2 flex -space-x-1.5">
          {task.members.slice(0, 3).map((m: any) => (
            <span
              key={m.user.id}
              title={m.user.fullName}
              className="flex h-5 w-5 items-center justify-center rounded-full border border-surface bg-accent-muted text-[9px] font-medium text-accent"
            >
              {m.user.fullName?.charAt(0).toUpperCase() || '?'}
            </span>
          ))}
        </div>
      )}

      {task.labels?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {task.labels.map((l: any) => (
            <span
              key={l.label.id}
              className="rounded bg-surface-muted px-1.5 py-0.5 text-[10px] text-foreground-muted"
            >
              {l.label.name}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
