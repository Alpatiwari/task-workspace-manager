'use client';

import Link from 'next/link';

const PRIORITY_STYLE: Record<string, string> = {
  URGENT: 'text-red-600',
  HIGH: 'text-orange-500',
  MEDIUM: 'text-amber-500',
  LOW: 'text-foreground-muted',
  NO_PRIORITY: 'text-foreground-muted',
};

export function TaskCard({ task }: { task: any }) {
  return (
    <Link
      href={`/tasks/${task.id}`}
      className="block rounded-lg border border-border bg-surface p-3 text-sm shadow-sm transition hover:border-accent"
    >
      <p className="font-medium">{task.title}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className={`text-xs ${PRIORITY_STYLE[task.priority] || ''}`}>
          {task.priority?.replace('_', ' ')}
        </span>
        {task.dueDate && (
          <span className="text-xs text-foreground-muted">
            {new Date(task.dueDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
          </span>
        )}
      </div>
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
