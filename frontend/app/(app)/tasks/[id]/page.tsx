'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatLabel } from '@/lib/format';

const STATUSES = ['TODO', 'DOING', 'COMPLETED', 'ON_HOLD'];
const PRIORITIES = ['NO_PRIORITY', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'];

// Turns a timestamp into a short relative label like "2h ago" or "3d ago".
function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [task, setTask] = useState<any>(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingField, setSavingField] = useState<string | null>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .getTask(id)
      .then(setTask)
      .catch((e) => setError(e.message || 'Something went wrong loading this task'))
      .finally(() => setLoading(false));
    api.getTeams().then(setTeams).catch(() => {});
  }, [id]);

  async function handleCreateTeam() {
    if (!newTeamName.trim()) return;
    const team = await api.createTeam(newTeamName.trim());
    setTeams((prev) => [...prev, team]);
    setNewTeamName('');
    setCreatingTeam(false);
    handleFieldChange('teamId', team.id);
  }

  async function handleAddComment() {
    if (!comment.trim()) return;
    const newComment = await api.addComment(id, comment);
    setTask((t: any) => ({ ...t, comments: [...t.comments, newComment] }));
    setComment('');
  }

  // Shared handler for the Details panel's editable fields (status, priority,
  // due date). Updates optimistically, persists via the existing updateTask
  // API, and rolls back on failure.
  async function handleFieldChange(field: string, value: string | null) {
    const previous = task[field];
    setTask((t: any) => ({ ...t, [field]: value }));
    setSavingField(field);
    try {
      await api.updateTask(id, { [field]: value });
    } catch (e) {
      setTask((t: any) => ({ ...t, [field]: previous }));
    } finally {
      setSavingField(null);
    }
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
    <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row lg:items-start">
      {/* Main content column */}
      <div className="min-w-0 flex-1">
        <h1 className="text-xl font-semibold">{task.title}</h1>
        {task.description && (
          <p className="mt-2 text-sm text-foreground-muted">{task.description}</p>
        )}

        {/* Properties row — reporter + date range as compact chips */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-md border border-border px-2 py-1 text-foreground-muted">
            {task.reporter?.fullName || 'Unassigned'}
          </span>
          {(task.startDate || task.dueDate) && (
            <span className="rounded-md border border-border px-2 py-1 text-foreground-muted">
              {task.startDate &&
                new Date(task.startDate).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                })}
              {task.startDate && task.dueDate && ' → '}
              {task.dueDate &&
                new Date(task.dueDate).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                })}
            </span>
          )}
        </div>

        {/* Labels — display only; no label-management endpoint exists yet */}
        {task.labels?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {task.labels.map((l: any) => (
              <span
                key={l.label.id}
                className="rounded bg-surface-muted px-2 py-0.5 text-xs text-foreground-muted"
              >
                {l.label.name}
              </span>
            ))}
          </div>
        )}

        {/* Resources — visual placeholder only; no attachments backend yet */}
        <div className="mt-4">
          <p className="mb-1 text-sm font-medium">Resources</p>
          <div className="rounded-md border border-dashed border-border px-3 py-2 text-sm text-foreground-muted">
            Add document or link…
          </div>
        </div>

        {/* Subtasks */}
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

        {/* Comments thread */}
        <div className="mt-6">
          <h2 className="mb-2 text-sm font-medium">Comments</h2>
          <div className="flex flex-col gap-3">
            {task.comments?.map((c: any) => (
              <div key={c.id} className="flex items-start gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-muted text-[10px] font-medium text-accent">
                  {c.author.fullName?.charAt(0).toUpperCase() || '?'}
                </span>
                <div className="min-w-0 flex-1 rounded-md bg-surface-muted p-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{c.author.fullName}</span>
                    <span className="text-xs text-foreground-muted">{timeAgo(c.createdAt)}</span>
                  </div>
                  <p className="mt-0.5 text-foreground-muted">{c.body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
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

      {/* Details side panel */}
      <div className="w-full shrink-0 rounded-lg border border-border bg-surface p-4 text-sm lg:w-72">
        <p className="mb-3 text-sm font-medium">Details</p>

        <div className="flex flex-col gap-3">
          <div>
            <p className="mb-1 text-xs text-foreground-muted">Status</p>
            <select
              value={task.status}
              onChange={(e) => handleFieldChange('status', e.target.value)}
              disabled={savingField === 'status'}
              className="w-full rounded-md border border-border bg-surface px-2 py-1.5 text-sm outline-none focus:border-accent disabled:opacity-50"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {formatLabel(s)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="mb-1 text-xs text-foreground-muted">Priority</p>
            <select
              value={task.priority}
              onChange={(e) => handleFieldChange('priority', e.target.value)}
              disabled={savingField === 'priority'}
              className="w-full rounded-md border border-border bg-surface px-2 py-1.5 text-sm outline-none focus:border-accent disabled:opacity-50"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {formatLabel(p)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="mb-1 text-xs text-foreground-muted">Members</p>
            {task.members?.length > 0 ? (
              <div className="flex -space-x-1.5">
                {task.members.map((m: any) => (
                  <span
                    key={m.user.id}
                    title={m.user.fullName}
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-surface bg-accent-muted text-[10px] font-medium text-accent"
                  >
                    {m.user.fullName?.charAt(0).toUpperCase() || '?'}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-foreground-muted">No members yet.</p>
            )}
          </div>

          <div>
            <p className="mb-1 text-xs text-foreground-muted">Dates</p>
            <div className="grid grid-cols-2 gap-1.5">
              <input
                type="date"
                aria-label="Start date"
                value={task.startDate ? task.startDate.slice(0, 10) : ''}
                onChange={(e) => handleFieldChange('startDate', e.target.value)}
                disabled={savingField === 'startDate'}
                className="w-full rounded-md border border-border bg-surface px-2 py-1.5 text-sm outline-none focus:border-accent disabled:opacity-50"
              />
              <input
                type="date"
                aria-label="Due date"
                value={task.dueDate ? task.dueDate.slice(0, 10) : ''}
                min={task.startDate ? task.startDate.slice(0, 10) : undefined}
                onChange={(e) => handleFieldChange('dueDate', e.target.value)}
                disabled={savingField === 'dueDate'}
                className="w-full rounded-md border border-border bg-surface px-2 py-1.5 text-sm outline-none focus:border-accent disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <p className="mb-1 text-xs text-foreground-muted">Teams</p>
            <select
              value={task.teamId || ''}
              onChange={(e) => {
                if (e.target.value === '__new__') {
                  setCreatingTeam(true);
                  return;
                }
                handleFieldChange('teamId', e.target.value || null);
              }}
              disabled={savingField === 'teamId'}
              className="w-full rounded-md border border-border bg-surface px-2 py-1.5 text-sm outline-none focus:border-accent disabled:opacity-50"
            >
              <option value="">No team</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
              <option value="__new__">+ New team…</option>
            </select>
            {creatingTeam && (
              <div className="mt-1.5 flex gap-1.5">
                <input
                  autoFocus
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Team name"
                  className="min-w-0 flex-1 rounded-md border border-border bg-surface px-2 py-1 text-xs outline-none focus:border-accent"
                />
                <button
                  onClick={handleCreateTeam}
                  disabled={!newTeamName.trim()}
                  className="rounded-md bg-accent px-2 py-1 text-xs text-accent-fg disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            )}
          </div>

          <div>
            <p className="mb-1 text-xs text-foreground-muted">Reporter</p>
            <p className="text-sm">{task.reporter?.fullName || '—'}</p>
          </div>
        </div>

        {/* Updates — same ActivityLog data as before, restyled to sit in the panel */}
        <div className="mt-5 border-t border-border pt-3">
          <p className="mb-2 text-xs font-medium text-foreground-muted">Updates</p>
          {task.activity?.length ? (
            <div className="flex flex-col gap-2">
              {task.activity.map((a: any) => (
                <div key={a.id} className="text-xs">
                  <p className="text-foreground-muted">
                    <span className="font-medium text-foreground">
                      {a.actor?.fullName || 'Someone'}
                    </span>{' '}
                    {a.action}
                  </p>
                  <span className="text-foreground-muted/70">{timeAgo(a.createdAt)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-foreground-muted">No activity yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}