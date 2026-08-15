'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getToken } from '@/lib/api';
import { KanbanBoard } from '@/components/board/KanbanBoard';

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  async function handleAddTask(status: string) {
    const title = prompt('Task title');
    if (!title) return;
    const newTask = await api.createTask({ title, status });
    setTasks((prev) => [...prev, newTask]);
  }

  if (loading) return <p className="text-sm text-foreground-muted">Loading tasks…</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold">Tasks</h1>
      <KanbanBoard tasks={tasks} onAddTask={handleAddTask} />
    </div>
  );
}
