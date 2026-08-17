'use client';

import { useState } from 'react';
import { formatLabel } from '@/lib/format';

const PRIORITIES = ['NO_PRIORITY', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'];

interface NewProjectInput {
  title: string;
  priority: string;
  dueDate?: string;
}

export function AddProjectModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (input: NewProjectInput) => Promise<void>;
}) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('NO_PRIORITY');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await onCreate({
        title: title.trim(),
        priority,
        dueDate: dueDate || undefined,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-lg border border-border bg-surface p-5 shadow-xl"
      >
        <h2 className="text-base font-semibold">New project</h2>

        <div className="mt-4 flex flex-col gap-3 text-sm">
          <label className="block">
            <span className="mb-1 block text-foreground-muted">Title</span>
            <input
              autoFocus
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Website Redesign"
              className="w-full rounded-md border border-border bg-surface px-3 py-1.5 outline-none focus:border-accent"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-foreground-muted">Priority</span>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-md border border-border bg-surface px-3 py-1.5 outline-none focus:border-accent"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {formatLabel(p)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-foreground-muted">Due Date</span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-md border border-border bg-surface px-3 py-1.5 outline-none focus:border-accent"
              />
            </label>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground-muted hover:bg-surface-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !title.trim()}
            className="rounded-md bg-accent px-3 py-1.5 text-sm text-accent-fg disabled:opacity-50"
          >
            {submitting ? 'Adding…' : 'Add Project'}
          </button>
        </div>
      </form>
    </div>
  );
}