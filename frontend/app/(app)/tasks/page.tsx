'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getToken } from '@/lib/api';
import { KanbanBoard } from '@/components/board/KanbanBoard';
import { AddTaskModal } from '@/components/board/AddTaskModal';

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalStatus, setModalStatus] = useState<string | null>(null);

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

  if (loading) return <p className="text-sm text-foreground-muted">Loading tasks…</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold">Tasks</h1>
      <KanbanBoard tasks={tasks} onAddTask={setModalStatus} />

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
