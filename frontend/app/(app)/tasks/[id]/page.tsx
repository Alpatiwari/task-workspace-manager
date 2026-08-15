'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [task, setTask] = useState<any>(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    api.getTask(id).then(setTask);
  }, [id]);

  async function handleAddComment() {
    if (!comment.trim()) return;
    const newComment = await api.addComment(id, comment);
    setTask((t: any) => ({ ...t, comments: [...t.comments, newComment] }));
    setComment('');
  }

  if (!task) return <p className="text-sm text-foreground-muted">Loading…</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-xl font-semibold">{task.title}</h1>
      {task.description && <p className="mt-2 text-sm text-foreground-muted">{task.description}</p>}

      <div className="mt-4 grid grid-cols-2 gap-4 rounded-lg border border-border p-4 text-sm">
        <div>
          <p className="text-foreground-muted">Status</p>
          <p className="font-medium">{task.status}</p>
        </div>
        <div>
          <p className="text-foreground-muted">Priority</p>
          <p className="font-medium">{task.priority}</p>
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
          <table className="w-full text-sm">
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
                  <td className="py-1.5">{s.priority}</td>
                  <td className="py-1.5">
                    {s.dueDate ? new Date(s.dueDate).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
        <div className="mt-2 flex gap-2">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment…"
            className="flex-1 rounded-md border border-border bg-surface px-3 py-1.5 text-sm outline-none focus:border-accent"
          />
          <button
            onClick={handleAddComment}
            className="rounded-md bg-accent px-3 py-1.5 text-sm text-accent-fg"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
