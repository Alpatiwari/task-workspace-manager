'use client';

import { useState } from 'react';

export const ALL_FIELDS = ['Priority', 'Members', 'Due Date', 'Labels', 'Status', 'Reporter', 'Teams'] as const;
export type FieldKey = (typeof ALL_FIELDS)[number];

export function FieldsPicker({
  visible,
  onChange,
}: {
  visible: Record<FieldKey, boolean>;
  onChange: (next: Record<FieldKey, boolean>) => void;
}) {
  const [open, setOpen] = useState(false);

  function toggle(field: FieldKey) {
    onChange({ ...visible, [field]: !visible[field] });
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground-muted hover:bg-surface-muted"
      >
        Fields
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-44 rounded-md border border-border bg-surface p-1.5 text-sm shadow-lg">
            {ALL_FIELDS.map((field) => (
              <label
                key={field}
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-surface-muted"
              >
                <input
                  type="checkbox"
                  checked={visible[field]}
                  onChange={() => toggle(field)}
                  className="accent-current"
                />
                {field}
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  );
}