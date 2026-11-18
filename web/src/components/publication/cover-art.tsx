/**
 * Cover artwork for the PDF, per publication. Each one is built from the subject itself
 * rather than decoration. Falls back to a large outlined series number.
 */

const REST_LOG: [string, string, string, string][] = [
  ["GET", "/v1/projects?limit=20", "200", "positive"],
  ["POST", "/v1/projects", "201", "positive"],
  ["GET", "/v1/projects/prj_8f2a", "304", "accent"],
  ["PATCH", "/v1/projects/prj_8f2a", "412", "gold"],
  ["GET", "/v1/projects/prj_8f2a", "200", "positive"],
  ["PATCH", "/v1/projects/prj_8f2a", "200", "positive"],
  ["DELETE", "/v1/projects/prj_91be", "403", "gold"],
  ["POST", "/v1/exports", "202", "positive"],
  ["GET", "/v1/exports/exp_55d1", "200", "positive"],
  ["POST", "/v1/payments", "429", "gold"],
  ["POST", "/v1/payments", "201", "positive"],
  ["GET", "/v2/projects", "200", "positive"],
  ["GET", "/v1/projects", "410", "danger"],
];

const VERB_COLORS: Record<string, string> = {
  GET: "#34d399",
  POST: "#5fd0e8",
  PATCH: "#a99bf5",
  PUT: "#e8b872",
  DELETE: "#f47c7c",
};

const STATUS_COLORS: Record<string, string> = {
  positive: "#34d399",
  accent: "#5fd0e8",
  gold: "#e8b872",
  danger: "#f47c7c",
};

function RestCover() {
  return (
    <div className="pdf-cover-log" aria-hidden>
      {REST_LOG.map(([verb, path, status, tone], i) => (
        <div key={i} className="pdf-cover-log-line" style={{ opacity: 0.35 + (i / REST_LOG.length) * 0.65 }}>
          <span style={{ color: VERB_COLORS[verb] }}>{verb.padEnd(6, " ")}</span>
          <span className="pdf-cover-log-path">{path}</span>
          <span style={{ color: STATUS_COLORS[tone] }}>{status}</span>
        </div>
      ))}
    </div>
  );
}

/** A terminal transcript: each line is a list of [text, colour] segments. */
type Seg = [string, string?];
const C = { accent: "#5fd0e8", gold: "#e8b872", positive: "#34d399", danger: "#f47c7c", violet: "#a99bf5", muted: "#7d8aa3", ink: "#d6dce8" };

function Terminal({ lines }: { lines: Seg[][] }) {
  return (
    <div className="pdf-cover-term" aria-hidden>
      {lines.map((line, i) => (
        <div key={i} style={{ opacity: 0.4 + (i / lines.length) * 0.6 }}>
          {line.length === 0 ? " " : line.map(([text, color], j) => (
            <span key={j} style={{ color: color ?? C.ink }}>{text}</span>
          ))}
        </div>
      ))}
    </div>
  );
}

const GIT_LINES: Seg[][] = [
  [["$ ", C.muted], ["git log --oneline --graph", C.ink]],
  [["*   ", C.accent], ["9c1e2fa ", C.gold], ["(HEAD -> main, origin/main) ", C.positive], ["Merge pull request #214"]],
  [["|\\  ", C.accent]],
  [["| * ", C.accent], ["4b7d0e3 ", C.gold], ["Add rate limiting to the login endpoint"]],
  [["| * ", C.accent], ["1f9a8c2 ", C.gold], ["Test the limiter"]],
  [["|/  ", C.accent]],
  [["*   ", C.accent], ["e5c4b21 ", C.gold], ["Fix null avatar crash"]],
  [["*   ", C.accent], ["a3f9d10 ", C.gold], ["(tag: v1.4.0) ", C.violet], ["Upgrade Django"]],
  [["*   ", C.accent], ["7d2c9e8 ", C.gold], ["Add CSV export"]],
  [["*   ", C.accent], ["0b5f1a4 ", C.gold], ["Initial commit"]],
];

const SD_LINES: Seg[][] = [
  [["# capacity estimate: url shortener", C.muted]],
  [["links / day        ", C.ink], ["1,000,000", C.accent]],
  [["  ÷ 86,400         ", C.muted], ["≈ 12 writes/s", C.positive]],
  [["redirects / day    ", C.ink], ["100,000,000", C.accent]],
  [["  ÷ 86,400         ", C.muted], ["≈ 1,157 reads/s", C.positive]],
  [["  × peak 4         ", C.muted], ["≈ 4,630 reads/s", C.gold]],
  [["record size        ", C.ink], ["< 1 KB", C.accent]],
  [["  × 365 days       ", C.muted], ["≈ 365 GB/year", C.positive]],
  [["code space 62^7    ", C.ink], ["≈ 3.5 × 10^12", C.violet]],
  [["read : write       ", C.ink], ["100 : 1  → cache first", C.gold]],
];

const AI_LINES: Seg[][] = [
  [["$ ", C.muted], ["evals run summarize --prompt v13", C.ink]],
  [["  golden set       ", C.muted], ["184 examples"]],
  [["  accuracy         ", C.muted], ["0.91 → 0.94      ", C.ink], ["pass", C.positive]],
  [["  schema validity  ", C.muted], ["1.00 → 1.00      ", C.ink], ["pass", C.positive]],
  [["  latency p50      ", C.muted], ["1.8s → 2.1s      ", C.ink], ["check", C.gold]],
  [["  cost per call    ", C.muted], ["$0.0021 → $0.0024 ", C.ink], ["check", C.gold]],
  [["  regressions      ", C.muted], ["2                ", C.ink], ["review", C.danger]],
  [],
  [["  report  ", C.muted], ["evals/summarize/v13.html", C.accent]],
];

const DJ_LINES: Seg[][] = [
  [["$ ", C.muted], ["python manage.py migrate", C.ink]],
  [["Operations to perform:", C.violet]],
  [["  Apply all migrations: accounts, auth, billing, projects", C.muted]],
  [["Running migrations:", C.violet]],
  [["  Applying accounts.0001_initial...", C.ink], [" OK", C.positive]],
  [["  Applying projects.0001_initial...", C.ink], [" OK", C.positive]],
  [["  Applying projects.0002_project_status...", C.ink], [" OK", C.positive]],
  [["  Applying billing.0001_initial...", C.ink], [" OK", C.positive]],
  [["$ ", C.muted], ["python manage.py check --deploy", C.ink]],
  [["System check identified no issues (0 silenced).", C.positive]],
];

const COVERS: Record<string, () => React.ReactElement> = {
  "practical-rest-api-handbook": RestCover,
  "git-github-field-guide": () => <Terminal lines={GIT_LINES} />,
  "system-design-fundamentals": () => <Terminal lines={SD_LINES} />,
  "ai-prototype-to-production": () => <Terminal lines={AI_LINES} />,
  "django-practical-reference": () => <Terminal lines={DJ_LINES} />,
};

export function CoverArt({ slug, series }: { slug: string; series: string }) {
  const Art = COVERS[slug];
  if (Art) return <Art />;
  return (
    <div className="pdf-cover-fallback" aria-hidden>
      {series}
    </div>
  );
}
