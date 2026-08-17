'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatLabel } from '@/lib/format';
import { AddProjectModal } from '@/components/board/AddProjectModal';

const PRIORITIES = ['NO_PRIORITY', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    api.getProjects().then(setProjects);
  }, []);

  async function handleCreate(input: { title: string; priority: string; dueDate?: string }) {
    const newProject = await api.createProject(input);
    setProjects((prev) => [...prev, newProject]);
  }

  // Inline priority editing — optimistic update, persists via the
  // updateProject endpoint that already existed on the backend.
  async function handlePriorityChange(projectId: string, priority: string) {
    const previous = projects.find((p) => p.id === projectId)?.priority;
    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, priority } : p)));
    setSavingId(projectId);
    try {
      await api.updateProject(projectId, { priority });
    } catch (e) {
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, priority: previous } : p)),
      );
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg font-semibold">Projects</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="w-fit rounded-md bg-accent px-3 py-1.5 text-sm text-accent-fg"
        >
          + Add Project
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm">
          <thead className="border-b border-border text-left text-foreground-muted">
            <tr>
              <th className="pb-2 font-normal">Projects</th>
              <th className="pb-2 font-normal">Priority</th>
              <th className="pb-2 font-normal">Lead</th>
              <th className="pb-2 font-normal">Due Date</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} className="border-b border-border">
                <td className="py-2">{p.title}</td>
                <td className="py-2">
                  <select
                    value={p.priority || 'NO_PRIORITY'}
                    onChange={(e) => handlePriorityChange(p.id, e.target.value)}
                    disabled={savingId === p.id}
                    className="rounded-md border border-transparent bg-transparent py-0.5 pr-1 outline-none hover:border-border focus:border-accent disabled:opacity-50"
                  >
                    {PRIORITIES.map((pr) => (
                      <option key={pr} value={pr}>
                        {formatLabel(pr)}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-2">{p.lead?.fullName || '—'}</td>
                <td className="py-2">
                  {p.dueDate ? new Date(p.dueDate).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <AddProjectModal onClose={() => setModalOpen(false)} onCreate={handleCreate} />
      )}
    </div>
  );
}