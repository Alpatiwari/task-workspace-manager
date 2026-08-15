'use client';

import { useEffect, useState } from 'react';
import { api, clearToken } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getMe().then(setUser);
  }, []);

  async function handleSave() {
    setSaving(true);
    await api.updateMe({
      fullName: user.fullName,
      title: user.title,
      username: user.username,
    });
    setSaving(false);
  }

  function handleLeave() {
    if (!confirm('Leave this workspace? This cannot be undone.')) return;
    clearToken();
    router.push('/login');
  }

  if (!user) return <p className="text-sm text-foreground-muted">Loading…</p>;

  return (
    <div className="max-w-md">
      <h1 className="mb-4 text-lg font-semibold">Profile</h1>

      <div className="flex flex-col gap-4 text-sm">
        <Field label="Email" value={user.email || '—'} readOnly />
        <Field
          label="Full name"
          value={user.fullName || ''}
          onChange={(v) => setUser({ ...user, fullName: v })}
        />
        <Field
          label="Title"
          placeholder="Your job title or role"
          value={user.title || ''}
          onChange={(v) => setUser({ ...user, title: v })}
        />
        <Field
          label="Username"
          placeholder="One word, like a nickname or first name"
          value={user.username || ''}
          onChange={(v) => setUser({ ...user, username: v })}
        />

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-fit rounded-md bg-accent px-3 py-1.5 text-accent-fg disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      <div className="mt-8 border-t border-border pt-4">
        <h2 className="mb-2 text-sm font-medium">Workspace access</h2>
        <button onClick={handleLeave} className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white">
          Leave Workspace
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  placeholder,
  readOnly,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  readOnly?: boolean;
  onChange?: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-foreground-muted">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full rounded-md border border-border bg-surface px-3 py-1.5 outline-none focus:border-accent disabled:opacity-60"
      />
    </label>
  );
}
