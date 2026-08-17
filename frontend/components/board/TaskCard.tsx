'use client';

import Link from 'next/link';
import { useDraggable } from '@dnd-kit/core';
import { formatLabel } from '@/lib/format';

const PRIORITY_COLOR: Record<string, string> = {
  URGENT: '#dc2626',
  HIGH: '#f97316',
  MEDIUM: '#f59e0b',
  LOW: '#9ca3af',
  NO_PRIORITY: '#d1d5db',
};

export function TaskCard({ task }: { task: any }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 10,
      }
    : undefined;

  return (
    // The drag handlers live on this wrapper div, not the <Link> itself —
    // dnd-kit's 8px activation distance (set in KanbanBoard) means a plain
    // click still passes through to the Link and navigates normally, while
    // a real drag is intercepted here.
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={isDragging ? 'opacity-50' : ''}
    >
      <Link
        href={`/tasks/${task.id}`}
        onClick={(e) => {
          // Prevents navigation from firing at the tail end of a drag
          // (dnd-kit sometimes lets the click event through after drop).
          if (isDragging) e.preventDefault();
        }}
        className="block cursor-grab rounded-lg border border-border bg-surface p-3 text-sm shadow-sm transition hover:border-accent active:cursor-grabbing"
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
    </div>
  );
}