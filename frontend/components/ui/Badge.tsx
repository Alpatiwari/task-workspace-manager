export function Badge({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`rounded bg-surface-muted px-1.5 py-0.5 text-[10px] text-foreground-muted ${className}`}>
      {children}
    </span>
  );
}
