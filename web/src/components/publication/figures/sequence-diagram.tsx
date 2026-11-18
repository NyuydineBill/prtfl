import { useId } from "react";

export type Participant = { id: string; label: string; sub?: string };
export type SequenceStep = {
  from: string;
  to: string;
  label: string;
  detail?: string;
  /** request = solid accent, response = dashed gold, internal = work inside one participant. */
  kind?: "request" | "response";
};

const W = 760;
const PAD_X = 92;
const HEAD_Y = 8;
const HEAD_H = 48;
const START_Y = HEAD_H + HEAD_Y + 26;
const ROW = 54;
const SELF_ROW = 62;

/**
 * Sequence diagram drawn from data. Renders an SVG when the figure is wide enough and a
 * numbered step list on narrow screens (switch handled by a container query in CSS).
 */
export function SequenceDiagram({
  participants,
  steps,
  ariaLabel,
}: {
  participants: Participant[];
  steps: SequenceStep[];
  ariaLabel: string;
}) {
  const uid = useId().replace(/:/g, "");
  const index = new Map(participants.map((p, i) => [p.id, i]));
  const span = (W - PAD_X * 2) / Math.max(participants.length - 1, 1);
  const laneX = (id: string) => PAD_X + (index.get(id) ?? 0) * span;

  const rows: { step: SequenceStep; i: number; self: boolean; top: number }[] = [];
  let cursor = START_Y;
  for (const [i, step] of steps.entries()) {
    const self = step.from === step.to;
    rows.push({ step, i, self, top: cursor });
    cursor += self ? SELF_ROW : ROW;
  }
  const height = cursor + 12;

  const labelOf = (id: string) => participants.find((p) => p.id === id)?.label ?? id;

  return (
    <div className="pub-seq">
      <svg
        className="pub-seq-svg"
        viewBox={`0 0 ${W} ${height}`}
        role="img"
        aria-label={ariaLabel}
      >
        <defs>
          <marker id={`${uid}-req`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" className="seq-head-req" />
          </marker>
          <marker id={`${uid}-res`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" className="seq-head-res" />
          </marker>
          <marker id={`${uid}-self`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" className="seq-head-self" />
          </marker>
        </defs>

        {participants.map((p) => {
          const x = laneX(p.id);
          return (
            <g key={p.id}>
              <line x1={x} x2={x} y1={HEAD_Y + HEAD_H} y2={height - 6} className="seq-lifeline" />
              <rect x={x - 74} y={HEAD_Y} width={148} height={HEAD_H} rx={8} className="seq-actor" />
              <text x={x} y={HEAD_Y + (p.sub ? 21 : 29)} textAnchor="middle" className="seq-actor-label">
                {p.label}
              </text>
              {p.sub ? (
                <text x={x} y={HEAD_Y + 37} textAnchor="middle" className="seq-actor-sub">
                  {p.sub}
                </text>
              ) : null}
            </g>
          );
        })}

        {rows.map(({ step, i, self, top }) => {
          const x1 = laneX(step.from);
          const n = String(i + 1);

          if (self) {
            const last = (index.get(step.from) ?? 0) === participants.length - 1;
            const dir = last ? -1 : 1;
            const lx = x1 + dir * 30;
            const y1 = top + 8;
            const y2 = top + 30;
            return (
              <g key={i}>
                <path
                  d={`M${x1},${y1} H${lx} V${y2} H${x1 + dir * 4}`}
                  className="seq-self"
                  markerEnd={`url(#${uid}-self)`}
                />
                <circle cx={x1} cy={y1} r={9} className="seq-num-bg seq-num-self" />
                <text x={x1} y={y1 + 3.5} textAnchor="middle" className="seq-num">{n}</text>
                <text x={lx + dir * 10} y={top + 18} textAnchor={last ? "end" : "start"} className="seq-label">
                  {step.label}
                </text>
                {step.detail ? (
                  <text x={lx + dir * 10} y={top + 34} textAnchor={last ? "end" : "start"} className="seq-detail">
                    {step.detail}
                  </text>
                ) : null}
              </g>
            );
          }

          const x2 = laneX(step.to);
          const dir = x2 > x1 ? 1 : -1;
          const lineY = top + 24;
          const mid = (x1 + x2) / 2;
          const res = step.kind === "response";
          return (
            <g key={i}>
              <line
                x1={x1 + dir * 10}
                x2={x2 - dir * 3}
                y1={lineY}
                y2={lineY}
                className={res ? "seq-res" : "seq-req"}
                markerEnd={`url(#${uid}-${res ? "res" : "req"})`}
              />
              <circle cx={x1} cy={lineY} r={9} className={`seq-num-bg ${res ? "seq-num-res" : "seq-num-req"}`} />
              <text x={x1} y={lineY + 3.5} textAnchor="middle" className="seq-num">{n}</text>
              <text x={mid} y={lineY - 8} textAnchor="middle" className="seq-label">
                {step.label}
              </text>
              {step.detail ? (
                <text x={mid} y={lineY + 16} textAnchor="middle" className="seq-detail">
                  {step.detail}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>

      <ol className="pub-seq-list" aria-label={ariaLabel}>
        {steps.map((step, i) => {
          const self = step.from === step.to;
          return (
            <li key={i} className={step.kind === "response" ? "is-res" : self ? "is-self" : "is-req"}>
              <span className="pub-seq-list-num">{i + 1}</span>
              <div>
                <p className="pub-seq-list-route">
                  {self ? labelOf(step.from) : `${labelOf(step.from)} → ${labelOf(step.to)}`}
                </p>
                <p className="pub-seq-list-label">{step.label}</p>
                {step.detail ? <p className="pub-seq-list-detail">{step.detail}</p> : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
