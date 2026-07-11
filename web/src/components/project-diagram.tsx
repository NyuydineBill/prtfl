import { ArrowRight } from "lucide-react";

export function ProjectFlowDiagram({ steps }: { steps: string[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface p-6">
      <div className="flex min-w-max items-center gap-2">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <div className="flex min-w-[9rem] max-w-[11rem] flex-col items-center gap-1.5 rounded-lg border border-border bg-surface-high px-4 py-3 text-center">
              <span className="font-mono text-[10px] text-accent">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-xs leading-snug text-foreground">{step}</span>
            </div>
            {i < steps.length - 1 && (
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
