import type { ReactNode } from "react";

type Tone = "accent" | "gold" | "positive" | "danger" | "violet" | "muted" | "warn";

export type TierNode = {
  name: ReactNode;
  sub?: ReactNode;
  tone?: Tone;
  /** Marks a component added at this stage of a design. */
  added?: boolean;
  /** Draws the box dashed: optional, external or outside your control. */
  dashed?: boolean;
};

export type Tier = {
  label?: string;
  nodes: TierNode[];
  /** Label on the connector drawn below this tier (omitted on the last tier). */
  link?: ReactNode;
};

/**
 * Layered architecture diagram in plain HTML, so it reflows on narrow screens instead of
 * shrinking. Each tier is a row of components; connectors between tiers carry a label.
 */
export function TierDiagram({ tiers, compact = false }: { tiers: Tier[]; compact?: boolean }) {
  return (
    <div className={`pub-tiers${compact ? " is-compact" : ""}`}>
      {tiers.map((tier, i) => (
        <div key={i} className="pub-tier-wrap">
          <div className="pub-tier">
            {tier.label ? <span className="pub-tier-label">{tier.label}</span> : null}
            <div className="pub-tier-nodes">
              {tier.nodes.map((node, j) => (
                <div
                  key={j}
                  className={`pub-node pub-tone-${node.tone ?? "muted"}${node.added ? " is-added" : ""}${node.dashed ? " is-dashed" : ""}`}
                >
                  <span className="pub-node-name">{node.name}</span>
                  {node.sub ? <span className="pub-node-sub">{node.sub}</span> : null}
                </div>
              ))}
            </div>
          </div>
          {i < tiers.length - 1 ? (
            <div className="pub-tier-link" aria-hidden>
              <span className="pub-tier-line" />
              {tier.link ? <span className="pub-tier-link-label">{tier.link}</span> : null}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export type Bar = {
  label: ReactNode;
  /** Value on the chart's own scale (already converted for log charts). */
  value: number;
  display: ReactNode;
  note?: ReactNode;
  tone?: Tone;
};

/** Horizontal measured bars. `max` sets the full-width value. */
export function Bars({ bars, max, scaleLabel }: { bars: Bar[]; max: number; scaleLabel?: ReactNode }) {
  return (
    <div className="pub-bars">
      {bars.map((bar, i) => (
        <div key={i} className={`pub-bar pub-tone-${bar.tone ?? "accent"}`}>
          <span className="pub-bar-label">{bar.label}</span>
          <span className="pub-bar-track">
            <span className="pub-bar-fill" style={{ width: `${Math.max(1.5, (bar.value / max) * 100)}%` }} />
          </span>
          <span className="pub-bar-value">{bar.display}</span>
          {bar.note ? <span className="pub-bar-note">{bar.note}</span> : null}
        </div>
      ))}
      {scaleLabel ? <p className="pub-bars-scale">{scaleLabel}</p> : null}
    </div>
  );
}

/** Numbered steps laid out across the figure, with an optional loop-back note. */
export function Steps({
  steps,
  loop,
  cols,
}: {
  steps: { title: ReactNode; body?: ReactNode; tone?: Tone; tag?: ReactNode }[];
  loop?: ReactNode;
  cols?: number;
}) {
  return (
    <div className="pub-steps-wrap">
      <ol className="pub-steps" style={cols ? ({ "--steps-cols": cols } as React.CSSProperties) : undefined}>
        {steps.map((step, i) => (
          <li key={i} className={`pub-tone-${step.tone ?? "accent"}`}>
            <span className="pub-steps-num">{String(i + 1).padStart(2, "0")}</span>
            <p className="pub-steps-title">{step.title}</p>
            {step.body ? <div className="pub-small">{step.body}</div> : null}
            {step.tag ? <div>{step.tag}</div> : null}
          </li>
        ))}
      </ol>
      {loop ? <p className="pub-steps-loop">{loop}</p> : null}
    </div>
  );
}
