'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getToken } from '@/lib/api';
import { KanbanBoard } from '@/components/board/KanbanBoard';
import { AddTaskModal } from '@/components/board/AddTaskModal';
import { TaskListView } from '@/components/list/TaskListView';
import { FieldsPicker, ALL_FIELDS, FieldKey } from '@/components/list/FieldsPicker';

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalStatus, setModalStatus] = useState<string | null>(null);
  const [view, setView] = useState<'board' | 'list'>('board');
  const [visibleFields, setVisibleFields] = useState<Record<FieldKey, boolean>>(
    Object.fromEntries(ALL_FIELDS.map((f) => [f, true])) as Record<FieldKey, boolean>,
  );

  useEffect(() => {
    if (!getToken()) {
      router.push('/login');
      return;
    }
    api
      .getTasks()
      .then(setTasks)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleCreate(input: {
    title: string;
    description?: string;
    priority: string;
    dueDate?: string;
    status: string;
  }) {
    const newTask = await api.createTask(input);
    setTasks((prev) => [...prev, newTask]);
  }

  // Drag-and-drop handler for the Kanban board. Updates local state
  // immediately so the card moves instantly, then persists the new status
  // via the existing updateTask API. Rolls back on failure.
  async function handleTaskMove(taskId: string, newStatus: string) {
    const previousStatus = tasks.find((t) => t.id === taskId)?.status;

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    );

    try {
      await api.updateTask(taskId, { status: newStatus });
    } catch (e) {
      // Roll back to the original column if the API call fails.
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: previousStatus } : t)),
      );
      setError('Could not move task — please try again.');
    }
  }

  if (loading) return <p className="text-sm text-foreground-muted">Loading tasks…</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg font-semibold">Tasks</h1>

        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-border p-0.5 text-sm">
            <button
              onClick={() => setView('list')}
              className={`rounded px-2.5 py-1 ${
                view === 'list' ? 'bg-accent-muted text-accent' : 'text-foreground-muted'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setView('board')}
              className={`rounded px-2.5 py-1 ${
                view === 'board' ? 'bg-accent-muted text-accent' : 'text-foreground-muted'
              }`}
            >
              Board
            </button>
          </div>

          {view === 'list' && <FieldsPicker visible={visibleFields} onChange={setVisibleFields} />}
        </div>
      </div>

      {view === 'board' ? (
        <KanbanBoard tasks={tasks} onAddTask={setModalStatus} onTaskMove={handleTaskMove} />
      ) : (
        <TaskListView tasks={tasks} visibleFields={visibleFields} onAddTask={setModalStatus} />
      )}

      {modalStatus && (
        <AddTaskModal
          status={modalStatus}
          onClose={() => setModalStatus(null)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}