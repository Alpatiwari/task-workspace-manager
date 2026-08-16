'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatLabel } from '@/lib/format';

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [task, setTask] = useState<any>(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .getTask(id)
      .then(setTask)
      .catch((e) => setError(e.message || 'Something went wrong loading this task'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAddComment() {
    if (!comment.trim()) return;
    const newComment = await api.addComment(id, comment);
    setTask((t: any) => ({ ...t, comments: [...t.comments, newComment] }));
    setComment('');
  }

  if (loading) return <p className="text-sm text-foreground-muted">Loading…</p>;

  if (error) {
    return (
      <div className="mx-auto max-w-md text-center">
        <p className="text-sm text-red-600">{error}</p>
        <p className="mt-1 text-sm text-foreground-muted">
          This task may have been deleted, or the link is out of date.
        </p>
        <button
          onClick={() => router.push('/tasks')}
          className="mt-4 rounded-md bg-accent px-3 py-1.5 text-sm text-accent-fg"
        >
          ← Back to Tasks
        </button>
      </div>
    );
  }

  if (!task) return null;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-xl font-semibold">{task.title}</h1>
      {task.description && <p className="mt-2 text-sm text-foreground-muted">{task.description}</p>}

      <div className="mt-4 grid grid-cols-1 gap-4 rounded-lg border border-border p-4 text-sm sm:grid-cols-2">
        <div>
          <p className="text-foreground-muted">Status</p>
          <p className="font-medium">{formatLabel(task.status)}</p>
        </div>
        <div>
          <p className="text-foreground-muted">Priority</p>
          <p className="font-medium">{formatLabel(task.priority)}</p>
        </div>
        <div>
          <p className="text-foreground-muted">Due Date</p>
          <p className="font-medium">
            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
          </p>
        </div>
        <div>
          <p className="text-foreground-muted">Reporter</p>
          <p className="font-medium">{task.reporter?.fullName || '—'}</p>
        </div>
      </div>

      {/* Subtasks — reuses the same shape as top-level tasks */}
      <div className="mt-6">
        <h2 className="mb-2 text-sm font-medium">Subtasks</h2>
        {task.subtasks?.length ? (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead className="text-left text-foreground-muted">
              <tr>
                <th className="pb-1 font-normal">Task</th>
                <th className="pb-1 font-normal">Priority</th>
                <th className="pb-1 font-normal">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {task.subtasks.map((s: any) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="py-1.5">{s.title}</td>
                  <td className="py-1.5">{formatLabel(s.priority)}</td>
                  <td className="py-1.5">
                    {s.dueDate ? new Date(s.dueDate).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        ) : (
          <p className="text-sm text-foreground-muted">No subtasks yet.</p>
        )}
      </div>

      {/* Comments */}
      <div className="mt-6">
        <h2 className="mb-2 text-sm font-medium">Comments</h2>
        <div className="flex flex-col gap-2">
          {task.comments?.map((c: any) => (
            <div key={c.id} className="rounded-md bg-surface-muted p-2 text-sm">
              <span className="font-medium">{c.author.fullName}</span>{' '}
              <span className="text-foreground-muted">{c.body}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment…"
            className="flex-1 rounded-md border border-border bg-surface px-3 py-1.5 text-sm outline-none focus:border-accent"
          />
          <button
            onClick={handleAddComment}
            className="w-fit rounded-md bg-accent px-3 py-1.5 text-sm text-accent-fg"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
