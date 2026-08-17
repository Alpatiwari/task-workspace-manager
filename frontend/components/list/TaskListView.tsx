'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatLabel } from '@/lib/format';
import type { FieldKey } from './FieldsPicker';

const SECTIONS: { status: string; label: string }[] = [
  { status: 'TODO', label: 'To Do' },
  { status: 'DOING', label: 'Doing' },
  { status: 'COMPLETED', label: 'Completed' },
  { status: 'ON_HOLD', label: 'On Hold' },
];

export function TaskListView({
  tasks,
  visibleFields,
  onAddTask,
}: {
  tasks: any[];
  visibleFields: Record<FieldKey, boolean>;
  onAddTask: (status: string) => void;
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  return (
    <div className="flex flex-col gap-6">
      {SECTIONS.map((section) => {
        const sectionTasks = tasks.filter((t) => t.status === section.status);
        const isCollapsed = collapsed[section.status];

        return (
          <div key={section.status}>
            <button
              onClick={() =>
                setCollapsed((prev) => ({ ...prev, [section.status]: !prev[section.status] }))
              }
              className="mb-2 flex items-center gap-2 text-sm font-medium"
            >
              <span className={`transition-transform ${isCollapsed ? '-rotate-90' : ''}`}>▾</span>
              {section.label}
              <span className="text-xs font-normal text-foreground-muted">{sectionTasks.length}</span>
            </button>

            {!isCollapsed && (
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full min-w-[600px] text-sm">
                  <thead className="border-b border-border bg-surface-muted text-left text-foreground-muted">
                    <tr>
                      <th className="px-3 py-2 font-normal">Task</th>
                      {visibleFields.Priority && <th className="px-3 py-2 font-normal">Priority</th>}
                      {visibleFields.Members && <th className="px-3 py-2 font-normal">Members</th>}
                      {visibleFields['Due Date'] && <th className="px-3 py-2 font-normal">Due Date</th>}
                      {visibleFields.Labels && <th className="px-3 py-2 font-normal">Labels</th>}
                      {visibleFields.Reporter && <th className="px-3 py-2 font-normal">Reporter</th>}
                      {visibleFields.Teams && <th className="px-3 py-2 font-normal">Teams</th>}
                      <th className="px-3 py-2 font-normal">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sectionTasks.map((task) => (
                      <tr key={task.id} className="border-b border-border last:border-0">
                        <td className="px-3 py-2">
                          <Link href={`/tasks/${task.id}`} className="hover:text-accent">
                            {task.title}
                          </Link>
                        </td>
                        {visibleFields.Priority && (
                          <td className="px-3 py-2">{formatLabel(task.priority || 'NO_PRIORITY')}</td>
                        )}
                        {visibleFields.Members && (
                          <td className="px-3 py-2">
                            {task.members?.length
                              ? task.members.map((m: any) => m.user.fullName).join(', ')
                              : '—'}
                          </td>
                        )}
                        {visibleFields['Due Date'] && (
                          <td className="px-3 py-2">
                            {task.startDate && task.dueDate
                              ? `${new Date(task.startDate).toLocaleDateString()} → ${new Date(task.dueDate).toLocaleDateString()}`
                              : task.dueDate
                                ? new Date(task.dueDate).toLocaleDateString()
                                : '—'}
                            
                          </td>
                        )}
                        {visibleFields.Labels && (
                          <td className="px-3 py-2">
                            {task.labels?.length ? task.labels.map((l: any) => l.label.name).join(', ') : '—'}
                          </td>
                        )}
                        {visibleFields.Reporter && (
                          <td className="px-3 py-2">{task.reporter?.fullName || '—'}</td>
                        )}
                        {visibleFields.Teams && (
                          <td className="px-3 py-2">{task.team?.name || '—'}</td>
                        )}
                        <td className="px-3 py-2">
                          <Link href={`/tasks/${task.id}`} className="text-foreground-muted hover:text-accent">
                            ···
                          </Link>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={7} className="px-3 py-2">
                        <button
                          onClick={() => onAddTask(section.status)}
                          className="text-xs text-foreground-muted hover:text-accent"
                        >
                          + Add Task
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}