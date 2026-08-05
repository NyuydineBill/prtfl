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
  as = "h2",
}: {
  index?: number;
  eyebrow?: string;
  title: string;
  description?: string;
  /** Use h1 for the page title; leave h2 for in-page sections. */
  as?: "h1" | "h2";
}) {
  const Heading = as;

  return (
    <div className="mb-8 max-w-2xl sm:mb-12">
      {eyebrow && (
        <p className="font-mono text-xs uppercase tracking-wider text-accent">
          {typeof index === "number" && (
            <span className="text-muted">{String(index).padStart(2, "0")} · </span>
          )}
          {eyebrow}
        </p>
      )}
      <Heading className="mt-2 text-2xl font-semibold text-foreground sm:mt-3 sm:text-3xl md:text-4xl">
        {title}
      </Heading>
      {description && (
        <p className="mt-2 text-base leading-relaxed text-muted sm:mt-3">{description}</p>
      )}
    </div>
  );
}
