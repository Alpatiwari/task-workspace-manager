'use client';

import { DndContext, DragEndEvent, PointerSensor, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import { TaskCard } from './TaskCard';

const COLUMNS: { status: string; label: string }[] = [
  { status: 'TODO', label: 'To Do' },
  { status: 'DOING', label: 'Doing' },
  { status: 'COMPLETED', label: 'Completed' },
  { status: 'ON_HOLD', label: 'On Hold' },
];

function Column({
  status,
  label,
  tasks,
  onAddTask,
}: {
  status: string;
  label: string;
  tasks: any[];
  onAddTask: (status: string) => void;
}) {
  // Registers this column as a drop target. `isOver` lets us highlight it
  // while a card is being dragged over, so it's obvious where it'll land.
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div key={status} className="w-64 shrink-0 md:w-72">
      <div className="mb-2 flex items-center justify-between px-1">
        <h3 className="text-sm font-medium">{label}</h3>
        <span className="text-xs text-foreground-muted">{tasks.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex min-h-[40px] flex-col gap-2 rounded-md transition-colors ${
          isOver ? 'bg-accent-muted/40' : ''
        }`}
      >
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
        <button
          onClick={() => onAddTask(status)}
          className="rounded-md border border-dashed border-border px-3 py-2 text-left text-xs text-foreground-muted hover:bg-surface-muted"
        >
          + Add Task
        </button>
      </div>
    </div>
  );
}

export function KanbanBoard({
  tasks,
  onAddTask,
  onTaskMove,
}: {
  tasks: any[];
  onAddTask: (status: string) => void;
  // Called with (taskId, newStatus) whenever a card is dropped into a
  // different column. The parent owns the task list, so it's responsible
  // for updating local state and persisting via api.updateTask.
  onTaskMove: (taskId: string, newStatus: string) => void;
}) {
  // requires the pointer to move 8px before a drag starts — this is what
  // lets a plain click still navigate the TaskCard's <Link> instead of
  // every click being swallowed as a drag attempt.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;
    const task = tasks.find((t) => t.id === taskId);

    if (task && task.status !== newStatus) {
      onTaskMove(taskId, newStatus);
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex gap-3 md:gap-4">
        {COLUMNS.map((col) => (
          <Column
            key={col.status}
            status={col.status}
            label={col.label}
            tasks={tasks.filter((t) => t.status === col.status)}
            onAddTask={onAddTask}
          />
        ))}
      </div>
    </DndContext>
  );
}