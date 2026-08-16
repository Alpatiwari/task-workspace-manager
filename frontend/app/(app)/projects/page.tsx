'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatLabel } from '@/lib/format';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    api.getProjects().then(setProjects);
  }, []);

  async function handleAdd() {
    const title = prompt('Project title');
    if (!title) return;
    const newProject = await api.createProject({ title });
    setProjects((prev) => [...prev, newProject]);
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg font-semibold">Projects</h1>
        <button
          onClick={handleAdd}
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
              <td className="py-2">{formatLabel(p.priority || 'NO_PRIORITY')}</td>
              <td className="py-2">{p.lead?.fullName || '—'}</td>
              <td className="py-2">{p.dueDate ? new Date(p.dueDate).toLocaleDateString() : '—'}</td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </div>
  );
}
