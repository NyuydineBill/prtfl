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

const COVERS: Record<string, () => React.ReactElement> = {
  "practical-rest-api-handbook": RestCover,
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
