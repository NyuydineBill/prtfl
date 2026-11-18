type Tone = "accent" | "gold" | "positive" | "danger" | "violet" | "muted";

export type GraphCommit = {
  id: string;
  /** Text inside the node, usually a letter. */
  label?: string;
  /** Horizontal slot (time runs left to right). */
  col: number;
  /** Row the commit sits on. */
  lane: number;
  parents?: string[];
  tone?: Tone;
  /** Drawn faint and dashed: a commit that no longer has a branch pointing at it. */
  ghost?: boolean;
};

export type GraphRef = {
  name: string;
  at: string;
  kind?: "branch" | "head" | "remote" | "tag";
  pos?: "right" | "above" | "below";
};

const STEP = 46;
const LANE = 46;
const R = 11;
const PAD_X = 24;
const PAD_Y = 30;
const CHAR = 6.7;

/**
 * A small commit graph drawn from data. Commits sit on lanes, edges run from parent to
 * child, and refs (branches, HEAD, remotes) are labels pinned to a commit. Sized in its own
 * units and capped so it never grows past its natural size.
 */
export function CommitGraph({
  commits,
  refs = [],
  ariaLabel,
  laneLabels,
}: {
  commits: GraphCommit[];
  refs?: GraphRef[];
  ariaLabel: string;
  /** Optional names at the left edge of each lane. */
  laneLabels?: string[];
}) {
  const byId = new Map(commits.map((c) => [c.id, c]));
  const labelW = laneLabels ? Math.max(...laneLabels.map((l) => l.length)) * CHAR + 18 : 0;
  const x = (c: GraphCommit) => PAD_X + labelW + c.col * STEP;
  const y = (c: GraphCommit) => PAD_Y + c.lane * LANE;

  const maxCol = Math.max(...commits.map((c) => c.col));
  const maxLane = Math.max(...commits.map((c) => c.lane));

  // Ref pills: right-hand refs on the same commit stack outward.
  const rightOffset = new Map<string, number>();
  const pills = refs.map((ref) => {
    const c = byId.get(ref.at);
    if (!c) return null;
    const w = ref.name.length * CHAR + 14;
    const pos = ref.pos ?? "right";
    let px = x(c) + R + 8;
    let py = y(c) - 9;
    if (pos === "right") {
      const used = rightOffset.get(ref.at) ?? 0;
      px += used;
      rightOffset.set(ref.at, used + w + 5);
    } else {
      px = x(c) - w / 2;
      py = pos === "above" ? y(c) - R - 24 : y(c) + R + 6;
    }
    return { ref, w, px, py };
  });

  const right = Math.max(
    x({ col: maxCol } as GraphCommit) + R + 8,
    ...pills.filter(Boolean).map((p) => p!.px + p!.w),
  );
  const width = Math.ceil(right + PAD_X);
  const height = PAD_Y * 2 + maxLane * LANE;

  return (
    <div className="pub-graph">
      <svg viewBox={`0 0 ${width} ${height}`} style={{ maxWidth: width * 1.15 }} role="img" aria-label={ariaLabel}>
        {laneLabels?.map((label, i) => (
          <text key={label} x={PAD_X - 6} y={PAD_Y + i * LANE + 4} className="graph-lane">
            {label}
          </text>
        ))}

        {commits.flatMap((c) =>
          (c.parents ?? []).map((pid) => {
            const p = byId.get(pid);
            if (!p) return null;
            const x1 = x(p), y1 = y(p), x2 = x(c), y2 = y(c);
            const d =
              y1 === y2
                ? `M${x1},${y1} L${x2},${y2}`
                : `M${x1},${y1} C${x1 + STEP * 0.55},${y1} ${x2 - STEP * 0.55},${y2} ${x2},${y2}`;
            return <path key={`${pid}-${c.id}`} d={d} className={`graph-edge${c.ghost ? " is-ghost" : ""}`} />;
          }),
        )}

        {commits.map((c) => (
          <g key={c.id} className={`graph-node pub-tone-${c.tone ?? "accent"}${c.ghost ? " is-ghost" : ""}`}>
            <circle cx={x(c)} cy={y(c)} r={R} />
            {c.label ? (
              <text x={x(c)} y={y(c) + 4} textAnchor="middle">
                {c.label}
              </text>
            ) : null}
          </g>
        ))}

        {pills.map((p) =>
          p ? (
            <g key={`${p.ref.name}-${p.ref.at}`} className={`graph-ref graph-ref-${p.ref.kind ?? "branch"}`}>
              <rect x={p.px} y={p.py} width={p.w} height={18} rx={4} />
              <text x={p.px + p.w / 2} y={p.py + 12.5} textAnchor="middle">
                {p.ref.name}
              </text>
            </g>
          ) : null,
        )}
      </svg>
    </div>
  );
}
