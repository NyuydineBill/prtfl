export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-xs uppercase tracking-wider text-accent">
      {children}
    </p>
  );
}

export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md border border-border bg-surface px-2.5 py-1 font-mono text-xs text-muted">
      {children}
    </span>
  );
}

export function StatusPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 font-mono text-xs text-muted">
      <span className="h-1.5 w-1.5 rounded-full bg-positive" />
      {children}
    </span>
  );
}

export function SectionHeading({
  index,
  eyebrow,
  title,
  description,
}: {
  index?: number;
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-12 max-w-2xl">
      {eyebrow && (
        <p className="font-mono text-xs uppercase tracking-wider text-accent">
          {typeof index === "number" && (
            <span className="text-muted">{String(index).padStart(2, "0")} · </span>
          )}
          {eyebrow}
        </p>
      )}
      <h2 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">{title}</h2>
      {description && (
        <p className="mt-3 text-base leading-relaxed text-muted">{description}</p>
      )}
    </div>
  );
}
