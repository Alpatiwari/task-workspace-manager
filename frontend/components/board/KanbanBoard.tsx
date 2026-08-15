'use client';

import { TaskCard } from './TaskCard';

const COLUMNS: { status: string; label: string }[] = [
  { status: 'TODO', label: 'To Do' },
  { status: 'DOING', label: 'Doing' },
  { status: 'COMPLETED', label: 'Completed' },
  { status: 'ON_HOLD', label: 'On Hold' },
];

export function KanbanBoard({
  tasks,
  onAddTask,
}: {
  tasks: any[];
  onAddTask: (status: string) => void;
}) {
  return (
    <div className="flex gap-4">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.status);
        return (
          <div key={col.status} className="w-72 shrink-0">
            <div className="mb-2 flex items-center justify-between px-1">
              <h3 className="text-sm font-medium">{col.label}</h3>
              <span className="text-xs text-foreground-muted">{columnTasks.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              {columnTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
              <button
                onClick={() => onAddTask(col.status)}
                className="rounded-md border border-dashed border-border px-3 py-2 text-left text-xs text-foreground-muted hover:bg-surface-muted"
              >
                + Add Task
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
