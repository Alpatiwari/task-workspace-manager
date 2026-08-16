import { SelectHTMLAttributes } from 'react';

export function Select({ className = '', ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm outline-none focus:border-accent ${className}`}
      {...props}
    />
  );
}
