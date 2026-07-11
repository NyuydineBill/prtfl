import { ImageIcon } from "lucide-react";

export function ProjectVisualPlaceholder({ name }: { name: string }) {
  return (
    <div
      className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-surface"
      style={{
        backgroundImage:
          "repeating-linear-gradient(135deg, var(--color-surface-high) 0px, var(--color-surface-high) 1px, transparent 1px, transparent 14px)",
      }}
    >
      <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-background/80 px-5 py-4 backdrop-blur-sm">
        <ImageIcon className="h-5 w-5 text-muted" />
        <p className="font-mono text-xs text-muted">{name} screenshots coming soon</p>
      </div>
    </div>
  );
}
