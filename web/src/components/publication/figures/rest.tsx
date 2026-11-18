import { FigureFrame, Tag } from "./frame";
import { SequenceDiagram } from "./sequence-diagram";

type FigureProps = { number?: number };

/* ------------------------------------------------------------------ */
/* 1. Request / response lifecycle                                     */
/* ------------------------------------------------------------------ */

const REQUEST_LINES: { text: string; part: string; tone: string }[] = [
  { text: "POST /v1/projects HTTP/1.1", part: "Request line: method, target, version", tone: "accent" },
  { text: "Host: api.example.com", part: "Headers", tone: "violet" },
  { text: "Authorization: Bearer eyJhbGciOi…", part: "", tone: "violet" },
  { text: "Content-Type: application/json", part: "", tone: "violet" },
  { text: "Idempotency-Key: 4f7d3c1e-…", part: "", tone: "violet" },
  { text: "", part: "Empty line ends the headers", tone: "muted" },
  { text: '{ "name": "Website relaunch" }', part: "Content (body)", tone: "gold" },
];

const RESPONSE_LINES: { text: string; part: string; tone: string }[] = [
  { text: "HTTP/1.1 201 Created", part: "Status line: version, code, reason", tone: "positive" },
  { text: "Location: /v1/projects/prj_8f2a", part: "Headers", tone: "violet" },
  { text: "Content-Type: application/json", part: "", tone: "violet" },
  { text: 'ETag: "a1b2c3"', part: "", tone: "violet" },
  { text: "", part: "Empty line", tone: "muted" },
  { text: '{ "id": "prj_8f2a", "name": "Website relaunch", … }', part: "Content (body)", tone: "gold" },
];

function MessageAnatomy({
  title,
  lines,
}: {
  title: string;
  lines: { text: string; part: string; tone: string }[];
}) {
  return (
    <div className="pub-anatomy">
      <p className="pub-anatomy-title">{title}</p>
      <div className="pub-anatomy-lines">
        {lines.map((line, i) => (
          <div key={i} className={`pub-anatomy-line pub-tone-${line.tone}`}>
            <code className="pub-anatomy-code">{line.text || " "}</code>
            {line.part ? <span>{line.part}</span> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export function HttpLifecycleFigure({ number }: FigureProps) {
  return (
    <FigureFrame
      id="http-lifecycle"
      number={number}
      wide
      title="The life of one API request"
      caption={
        <>
          A typical <code>POST</code> through a gateway to an API server and database. Real systems
          add or remove layers (CDNs, service meshes, caches), but the order of checks inside the
          API (authenticate, authorize, validate, then act) is worth keeping everywhere.
        </>
      }
    >
      <SequenceDiagram
        ariaLabel="Sequence diagram of an HTTP request travelling from client to database and back"
        participants={[
          { id: "client", label: "Client", sub: "browser, app, service" },
          { id: "edge", label: "Gateway", sub: "TLS, load balancer" },
          { id: "api", label: "API server", sub: "your code" },
          { id: "db", label: "Database", sub: "source of truth" },
        ]}
        steps={[
          { from: "client", to: "edge", label: "Send request over TLS", detail: "POST /v1/projects" },
          { from: "edge", to: "edge", label: "Terminate TLS, rate limit, route", detail: "adds X-Request-Id" },
          { from: "edge", to: "api", label: "Forward request", detail: "headers + body" },
          { from: "api", to: "api", label: "Authenticate → authorize → validate", detail: "401 / 403 / 422 exit here" },
          { from: "api", to: "db", label: "Write in a transaction", detail: "INSERT … RETURNING" },
          { from: "db", to: "api", label: "Committed row", kind: "response" },
          { from: "api", to: "edge", label: "201 Created", detail: "Location, ETag, JSON body", kind: "response" },
          { from: "edge", to: "client", label: "Response delivered", detail: "+ rate-limit headers", kind: "response" },
        ]}
      />
      <div className="pub-grid-2 pub-mt">
        <MessageAnatomy title="Anatomy of the request" lines={REQUEST_LINES} />
        <MessageAnatomy title="Anatomy of the response" lines={RESPONSE_LINES} />
      </div>
    </FigureFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Methods                                                           */
/* ------------------------------------------------------------------ */

type Mark = "yes" | "no" | "some";
const METHODS: {
  method: string;
  intent: string;
  safe: Mark;
  idempotent: Mark;
  body: Mark;
  cacheable: Mark;
  success: string;
}[] = [
  { method: "GET", intent: "Read", safe: "yes", idempotent: "yes", body: "no", cacheable: "yes", success: "200" },
  { method: "HEAD", intent: "Read headers only", safe: "yes", idempotent: "yes", body: "no", cacheable: "yes", success: "200" },
  { method: "POST", intent: "Create or run an action", safe: "no", idempotent: "no", body: "yes", cacheable: "some", success: "201 · 202 · 200" },
  { method: "PUT", intent: "Replace entirely", safe: "no", idempotent: "yes", body: "yes", cacheable: "no", success: "200 · 204 · 201" },
  { method: "PATCH", intent: "Change some fields", safe: "no", idempotent: "some", body: "yes", cacheable: "no", success: "200 · 204" },
  { method: "DELETE", intent: "Remove", safe: "no", idempotent: "yes", body: "no", cacheable: "no", success: "204 · 200 · 202" },
  { method: "OPTIONS", intent: "Discover capabilities, CORS", safe: "yes", idempotent: "yes", body: "no", cacheable: "no", success: "204 · 200" },
];

function MarkCell({ mark, label }: { mark: Mark; label: string }) {
  const text = mark === "yes" ? "Yes" : mark === "no" ? "No" : "Depends";
  return (
    <span className={`pub-mark pub-mark-${mark}`} aria-label={`${label}: ${text}`}>
      <span className="pub-mark-dot" aria-hidden />
      <span className="pub-mark-text">{text}</span>
    </span>
  );
}

export function HttpMethodsFigure({ number }: FigureProps) {
  return (
    <FigureFrame
      id="http-methods"
      number={number}
      wide
      title="HTTP methods at a glance"
      caption={
        <>
          Properties from RFC 9110 (and RFC 5789 for <code>PATCH</code>). “Request body” means the
          method defines meaning for one: a body on <code>GET</code> or <code>DELETE</code> has no
          defined semantics and may be dropped by intermediaries. <code>POST</code> responses are
          cacheable only with explicit freshness information, which is rare in APIs.
        </>
      }
    >
      <div className="pub-matrix" role="table" aria-label="HTTP method properties">
        <div className="pub-matrix-row pub-matrix-head" role="row">
          <span role="columnheader">Method</span>
          <span role="columnheader">Safe</span>
          <span role="columnheader">Idempotent</span>
          <span role="columnheader">Request body</span>
          <span role="columnheader">Cacheable</span>
          <span role="columnheader">Typical success</span>
        </div>
        {METHODS.map((m) => (
          <div className="pub-matrix-row" role="row" key={m.method}>
            <span role="cell" className="pub-matrix-method">
              <span className={`pub-verb pub-verb-${m.method.toLowerCase()}`}>{m.method}</span>
              <span className="pub-matrix-intent">{m.intent}</span>
            </span>
            <span role="cell" data-label="Safe"><MarkCell mark={m.safe} label="Safe" /></span>
            <span role="cell" data-label="Idempotent"><MarkCell mark={m.idempotent} label="Idempotent" /></span>
            <span role="cell" data-label="Request body"><MarkCell mark={m.body} label="Request body" /></span>
            <span role="cell" data-label="Cacheable"><MarkCell mark={m.cacheable} label="Cacheable" /></span>
            <span role="cell" data-label="Typical success" className="pub-mono">{m.success}</span>
          </div>
        ))}
      </div>

      <div className="pub-grid-2 pub-mt">
        <div className="pub-panel">
          <p className="pub-panel-title">Collection <code>/projects</code></p>
          <ul className="pub-route-list">
            <li><span className="pub-verb pub-verb-get">GET</span> list, filter, paginate</li>
            <li><span className="pub-verb pub-verb-post">POST</span> create, returns <code>201</code> + <code>Location</code></li>
          </ul>
        </div>
        <div className="pub-panel">
          <p className="pub-panel-title">Item <code>/projects/{"{id}"}</code></p>
          <ul className="pub-route-list">
            <li><span className="pub-verb pub-verb-get">GET</span> read one</li>
            <li><span className="pub-verb pub-verb-put">PUT</span> replace the whole representation</li>
            <li><span className="pub-verb pub-verb-patch">PATCH</span> change listed fields only</li>
            <li><span className="pub-verb pub-verb-delete">DELETE</span> remove</li>
          </ul>
        </div>
      </div>

      <div className="pub-legend">
        <span><strong>Safe:</strong> the client does not request a state change.</span>
        <span><strong>Idempotent:</strong> sending it twice has the same intended effect as once, so automatic retries are safe.</span>
      </div>
    </FigureFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Status code classes                                               */
/* ------------------------------------------------------------------ */

const CLASSES = [
  {
    range: "1xx",
    name: "Informational",
    meaning: "Interim response. Keep going.",
    tone: "violet",
    codes: [["100", "Continue"], ["103", "Early Hints"]],
  },
  {
    range: "2xx",
    name: "Success",
    meaning: "The request worked.",
    tone: "positive",
    codes: [["200", "OK"], ["201", "Created"], ["202", "Accepted"], ["204", "No Content"]],
  },
  {
    range: "3xx",
    name: "Redirection",
    meaning: "Look somewhere else, or use your cached copy.",
    tone: "accent",
    codes: [["301", "Moved Permanently"], ["304", "Not Modified"], ["307", "Temporary Redirect"], ["308", "Permanent Redirect"]],
  },
  {
    range: "4xx",
    name: "Client error",
    meaning: "Fix the request before sending it again.",
    tone: "gold",
    codes: [["400", "Bad Request"], ["401", "Unauthorized"], ["403", "Forbidden"], ["404", "Not Found"], ["409", "Conflict"], ["422", "Unprocessable Content"], ["429", "Too Many Requests"]],
  },
  {
    range: "5xx",
    name: "Server error",
    meaning: "The server failed. A later retry may work.",
    tone: "danger",
    codes: [["500", "Internal Server Error"], ["502", "Bad Gateway"], ["503", "Service Unavailable"], ["504", "Gateway Timeout"]],
  },
] as const;

const LADDER = [
  { q: "Is the caller under its rate limit?", no: "429", hint: "send Retry-After" },
  { q: "Does this URL support the method?", no: "405", hint: "send an Allow header" },
  { q: "Are valid credentials present?", no: "401", hint: "send WWW-Authenticate" },
  { q: "Is this caller allowed to do this?", no: "403", hint: "or 404 to hide existence" },
  { q: "Does the resource exist?", no: "404", hint: "410 if gone for good" },
  { q: "Could the request be parsed at all?", no: "400", hint: "malformed JSON, wrong types" },
  { q: "Does the content pass validation?", no: "422", hint: "field-level errors" },
  { q: "Is it consistent with current state?", no: "409", hint: "duplicate, version clash" },
];

export function StatusCodesFigure({ number }: FigureProps) {
  return (
    <FigureFrame
      id="status-codes"
      number={number}
      wide
      title="Status codes: five classes, and how to pick a 4xx"
      caption={
        <>
          The first digit is the contract: clients that do not recognise a code must treat it like
          the <code>x00</code> of its class (RFC 9110, section 15). The ladder is a practical order
          of checks; teams differ on some steps (for example, whether to return <code>403</code> or{" "}
          <code>404</code> for a resource the caller may not know about).
        </>
      }
    >
      <div className="pub-classes">
        {CLASSES.map((c) => (
          <div key={c.range} className={`pub-class pub-tone-${c.tone}`}>
            <div className="pub-class-head">
              <span className="pub-class-range">{c.range}</span>
              <span className="pub-class-name">{c.name}</span>
            </div>
            <p className="pub-class-meaning">{c.meaning}</p>
            <ul className="pub-class-codes">
              {c.codes.map(([code, label]) => (
                <li key={code}>
                  <span className="pub-mono">{code}</span> {label}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="pub-ladder">
        <p className="pub-panel-title">Choosing a client error: ask in order, stop at the first “no”</p>
        <ol>
          {LADDER.map((step) => (
            <li key={step.no}>
              <span className="pub-ladder-q">{step.q}</span>
              <span className="pub-ladder-arrow" aria-hidden>no →</span>
              <span className="pub-ladder-code">{step.no}</span>
              <span className="pub-ladder-hint">{step.hint}</span>
            </li>
          ))}
        </ol>
        <p className="pub-ladder-ok">
          All “yes”? Return a <strong>2xx</strong>. Something broke on your side? <strong>5xx</strong>,
          never a 2xx with an error inside.
        </p>
      </div>
    </FigureFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Authentication flow                                               */
/* ------------------------------------------------------------------ */

export function AuthFlowFigure({ number }: FigureProps) {
  return (
    <FigureFrame
      id="auth-flow"
      number={number}
      wide
      title="OAuth 2.0 authorization code flow with PKCE"
      caption={
        <>
          The flow recommended for browser, mobile and server apps alike by the OAuth 2.0 Security
          Best Current Practice (RFC 9700). PKCE (RFC 7636) binds the authorization code to the
          client that asked for it, so a stolen code is useless on its own. Use a proven library or
          identity provider for every step on the left half of this diagram.
        </>
      }
    >
      <SequenceDiagram
        ariaLabel="OAuth 2.0 authorization code flow with PKCE between user, client app, authorization server and API"
        participants={[
          { id: "user", label: "User + browser" },
          { id: "app", label: "Client app" },
          { id: "as", label: "Authorization server", sub: "issues tokens" },
          { id: "api", label: "Your API", sub: "resource server" },
        ]}
        steps={[
          { from: "app", to: "app", label: "Create code_verifier", detail: "challenge = BASE64URL(SHA-256(verifier))" },
          { from: "app", to: "user", label: "Redirect to /authorize", detail: "client_id, scope, state, code_challenge" },
          { from: "user", to: "as", label: "Sign in and consent", detail: "credentials never touch the app" },
          { from: "as", to: "app", label: "Redirect back with ?code=…&state=…", kind: "response" },
          { from: "app", to: "as", label: "POST /token", detail: "code + code_verifier" },
          { from: "as", to: "app", label: "Access token + refresh token", detail: "short-lived · longer-lived", kind: "response" },
          { from: "app", to: "api", label: "GET /v1/projects", detail: "Authorization: Bearer <access token>" },
          { from: "api", to: "api", label: "Validate token, then authorize", detail: "signature · exp · aud · scope · owner" },
          { from: "api", to: "app", label: "200 OK, or 401 / 403", kind: "response" },
        ]}
      />

      <div className="pub-grid-3 pub-mt">
        <div className="pub-panel">
          <p className="pub-panel-title">Every request: authentication</p>
          <p>Is the token genuine and current? Check signature or introspect, issuer, expiry and audience.</p>
          <Tag tone="gold">fails → 401</Tag>
        </div>
        <div className="pub-panel">
          <p className="pub-panel-title">Every request: scope</p>
          <p>Was this token granted the action? <code>projects:read</code> is not <code>projects:write</code>.</p>
          <Tag tone="gold">fails → 403</Tag>
        </div>
        <div className="pub-panel">
          <p className="pub-panel-title">Every object: ownership</p>
          <p>May this user touch <em>this</em> record? The check most often missing (OWASP API1).</p>
          <Tag tone="gold">fails → 403 or 404</Tag>
        </div>
      </div>
    </FigureFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Offset vs cursor pagination                                       */
/* ------------------------------------------------------------------ */

function Rows({ mode }: { mode: "offset" | "cursor" }) {
  return (
    <div className="pub-rows" aria-hidden>
      {Array.from({ length: 12 }, (_, i) => {
        const n = i + 1;
        const returned = n >= 9;
        const state = returned ? "returned" : mode === "offset" ? "scanned" : "skipped";
        return (
          <span key={n} className={`pub-row pub-row-${state}`}>
            {n}
          </span>
        );
      })}
    </div>
  );
}

function Letters({ items, dup }: { items: string[]; dup?: string }) {
  return (
    <span className="pub-letters">
      {items.map((l) => (
        <span key={l} className={`pub-letter${l === dup ? " is-dup" : ""}${l === "X" ? " is-new" : ""}`}>
          {l}
        </span>
      ))}
    </span>
  );
}

export function PaginationFigure({ number }: FigureProps) {
  return (
    <FigureFrame
      id="pagination"
      number={number}
      wide
      title="Offset vs cursor pagination: page 3, four items per page"
      caption={
        <>
          With an index on the sort key, a cursor query seeks straight to its starting point, so
          page 3 and page 3,000 cost about the same. An offset query still reads and throws away
          every skipped row, and new writes shift items between pages.
        </>
      }
    >
      <div className="pub-grid-2">
        <div className="pub-panel">
          <p className="pub-panel-title">Offset <Tag tone="gold">LIMIT 4 OFFSET 8</Tag></p>
          <Rows mode="offset" />
          <p className="pub-small">Rows 1 to 8 are read, then discarded. Cost grows with the offset.</p>
          <code className="pub-snippet">GET /projects?limit=4&amp;offset=8</code>
        </div>
        <div className="pub-panel">
          <p className="pub-panel-title">Cursor <Tag tone="positive">WHERE key &lt; cursor</Tag></p>
          <Rows mode="cursor" />
          <p className="pub-small">The index jumps to the row after the cursor. Earlier rows are never touched.</p>
          <code className="pub-snippet">GET /projects?limit=4&amp;cursor=eyJpZCI6OH0</code>
        </div>
      </div>

      <div className="pub-panel pub-mt">
        <p className="pub-panel-title">What happens when a new item <span className="pub-letter is-new">X</span> arrives between page 1 and page 2</p>
        <div className="pub-drift">
          <span className="pub-drift-label">Page 1</span>
          <Letters items={["A", "B", "C", "D"]} />
          <span className="pub-drift-label">Offset page 2</span>
          <span><Letters items={["D", "E", "F", "G"]} dup="D" /> <span className="pub-small">D is shown twice</span></span>
          <span className="pub-drift-label">Cursor page 2</span>
          <span><Letters items={["E", "F", "G", "H"]} /> <span className="pub-small">continues after D</span></span>
        </div>
      </div>

      <div className="pub-compare pub-mt" role="table" aria-label="Offset and cursor pagination compared">
        <div role="row" className="pub-compare-head"><span /><span>Offset</span><span>Cursor</span></div>
        <div role="row"><span>Jump to page N</span><span>Yes</span><span>No, next and previous only</span></div>
        <div role="row"><span>Cost of deep pages</span><span>Grows with offset</span><span>Constant with an index</span></div>
        <div role="row"><span>Stable while data changes</span><span>No: skips and duplicates</span><span>Yes</span></div>
        <div role="row"><span>Needs</span><span>Any ORDER BY</span><span>A unique, indexed sort key</span></div>
        <div role="row"><span>Good for</span><span>Small admin tables</span><span>Feeds, logs, large lists, sync</span></div>
      </div>
    </FigureFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 6. Error response anatomy                                            */
/* ------------------------------------------------------------------ */

const ERROR_LINES: { code: string; marker?: number; indent?: number }[] = [
  { code: "HTTP/1.1 422 Unprocessable Content", marker: 1 },
  { code: "Content-Type: application/problem+json", marker: 2 },
  { code: "" },
  { code: "{" },
  { code: '"type": "https://api.example.com/problems/validation",', marker: 3, indent: 1 },
  { code: '"title": "Your request has invalid fields.",', marker: 4, indent: 1 },
  { code: '"status": 422,', marker: 5, indent: 1 },
  { code: '"detail": "2 fields failed validation.",', marker: 6, indent: 1 },
  { code: '"instance": "/problems/occurrences/req_7Hc2kQ",', marker: 7, indent: 1 },
  { code: '"errors": [', marker: 8, indent: 1 },
  { code: '{ "pointer": "#/name", "detail": "is required" },', indent: 2 },
  { code: '{ "pointer": "#/due_date", "detail": "is in the past" }', indent: 2 },
  { code: "]", indent: 1 },
  { code: "}" },
];

const ERROR_NOTES: { n: number; title: string; body: string; std: "http" | "rfc" | "ext" }[] = [
  { n: 1, title: "Real status code", body: "Clients, proxies and monitoring trust this. Never 200 for an error.", std: "http" },
  { n: 2, title: "Media type", body: "application/problem+json tells clients which shape to expect.", std: "http" },
  { n: 3, title: "type", body: "Stable URI naming the problem kind. Clients branch on this. Defaults to about:blank.", std: "rfc" },
  { n: 4, title: "title", body: "Short human summary of the type. Should not change between occurrences.", std: "rfc" },
  { n: 5, title: "status", body: "Copy of the HTTP status, for logs that lose the header.", std: "rfc" },
  { n: 6, title: "detail", body: "Explanation of this occurrence, written to help the client fix it.", std: "rfc" },
  { n: 7, title: "instance", body: "Identifies this occurrence. Embedding the request ID lets support find the log line.", std: "rfc" },
  { n: 8, title: "errors", body: "Extension member. RFC 9457's own example uses this shape: a JSON Pointer to each bad field, so a form can highlight the right input.", std: "ext" },
];

export function ErrorAnatomyFigure({ number }: FigureProps) {
  return (
    <FigureFrame
      id="error-anatomy"
      number={number}
      wide
      title="Anatomy of a Problem Details error response (RFC 9457)"
      caption={
        <>
          Members 3 to 7 are defined by RFC 9457; all are optional, but <code>type</code>,{" "}
          <code>title</code> and <code>status</code> are worth always sending. Anything else is an
          extension member: allowed, and clients that do not understand it must ignore it.
        </>
      }
    >
      <div className="pub-annotated">
        <pre className="pub-annotated-code" aria-label="Example problem details response">
          {ERROR_LINES.map((line, i) => (
            <span key={i} className="pub-annotated-line">
              <span className="pub-annotated-marker">{line.marker ?? ""}</span>
              <span style={{ paddingLeft: `${(line.indent ?? 0) * 1.25}em` }}>{line.code || " "}</span>
            </span>
          ))}
        </pre>
        <ol className="pub-annotated-notes">
          {ERROR_NOTES.map((note) => (
            <li key={note.n}>
              <span className="pub-annotated-marker">{note.n}</span>
              <div>
                <p>
                  <code>{note.title}</code>{" "}
                  <Tag tone={note.std === "ext" ? "gold" : note.std === "http" ? "violet" : "accent"}>
                    {note.std === "ext" ? "extension" : note.std === "http" ? "HTTP" : "RFC 9457 member"}
                  </Tag>
                </p>
                <p>{note.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </FigureFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 7. Versioning                                                        */
/* ------------------------------------------------------------------ */

export function VersioningFigure({ number }: FigureProps) {
  return (
    <FigureFrame
      id="versioning"
      number={number}
      wide
      title="Retiring v1 without surprising anyone"
      caption={
        <>
          Header syntax from RFC 9745 (<code>Deprecation</code>, a Unix timestamp prefixed with @)
          and RFC 8594 (<code>Sunset</code>, an HTTP date). Dates are illustrative. What you return
          after sunset is your choice; <code>410 Gone</code> with a link to the migration guide is a
          common, clear option.
        </>
      }
    >
      <ol className="pub-timeline">
        <li className="pub-tone-positive">
          <span className="pub-timeline-dot" />
          <p className="pub-timeline-when">Phase 1</p>
          <p className="pub-timeline-what">v2 ships alongside v1</p>
          <p className="pub-small">Both versions served. Migration guide published.</p>
        </li>
        <li className="pub-tone-gold">
          <span className="pub-timeline-dot" />
          <p className="pub-timeline-when">Phase 2 · 1 Jan 2026</p>
          <p className="pub-timeline-what">v1 marked deprecated</p>
          <code className="pub-snippet">Deprecation: @1767225600</code>
          <code className="pub-snippet">Sunset: Wed, 30 Jun 2027 23:59:59 GMT</code>
          <code className="pub-snippet">Link: &lt;…/migrate-to-v2&gt;; rel=&quot;deprecation&quot;</code>
        </li>
        <li className="pub-tone-accent">
          <span className="pub-timeline-dot" />
          <p className="pub-timeline-when">Phase 3</p>
          <p className="pub-timeline-what">Migration window</p>
          <div className="pub-traffic" aria-label="v1 traffic falls while v2 traffic rises">
            <span className="pub-traffic-v1" />
            <span className="pub-traffic-v2" />
          </div>
          <p className="pub-small">Watch v1 traffic per client. Contact the stragglers by name.</p>
        </li>
        <li className="pub-tone-danger">
          <span className="pub-timeline-dot" />
          <p className="pub-timeline-when">Phase 4 · 30 Jun 2027</p>
          <p className="pub-timeline-what">v1 sunset</p>
          <code className="pub-snippet">410 Gone</code>
          <p className="pub-small">Only after traffic is near zero.</p>
        </li>
      </ol>

      <div className="pub-grid-2 pub-mt">
        <div className="pub-panel pub-tone-positive">
          <p className="pub-panel-title">Additive: ship in place</p>
          <ul className="pub-ticks">
            <li>New endpoint</li>
            <li>New optional request field</li>
            <li>New response field</li>
            <li>New enum value, if clients were told to expect unknowns</li>
          </ul>
        </div>
        <div className="pub-panel pub-tone-danger">
          <p className="pub-panel-title">Breaking: new version or migration</p>
          <ul className="pub-crosses">
            <li>Remove or rename a field</li>
            <li>Change a type or format</li>
            <li>Make an optional field required</li>
            <li>Change defaults, status codes or meaning</li>
          </ul>
        </div>
      </div>

      <div className="pub-grid-3 pub-mt">
        <div className="pub-panel"><p className="pub-panel-title">URL path</p><code className="pub-snippet">GET /v2/projects</code><p className="pub-small">Visible, easy to route and test.</p></div>
        <div className="pub-panel"><p className="pub-panel-title">Custom header</p><code className="pub-snippet">API-Version: 2026-11-01</code><p className="pub-small">Clean URLs; date versions suit frequent small changes.</p></div>
        <div className="pub-panel"><p className="pub-panel-title">Media type</p><code className="pub-snippet">Accept: application/vnd.example.v2+json</code><p className="pub-small">Versions the representation itself.</p></div>
      </div>
    </FigureFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 8. Quick reference sheet                                             */
/* ------------------------------------------------------------------ */

export function RestQuickReferenceFigure({ number }: FigureProps) {
  return (
    <FigureFrame id="rest-quick-reference" number={number} wide title="REST API quick reference">
      <div className="pub-qr">
        <section>
          <h4>URLs</h4>
          <ul>
            <li>Plural nouns: <code>/projects</code>, <code>/projects/{"{id}"}</code></li>
            <li>Lowercase, hyphens: <code>/payment-methods</code></li>
            <li>Nest at most two levels</li>
            <li>Non-CRUD action: <code>POST /invoices/{"{id}"}/send</code></li>
          </ul>
        </section>
        <section>
          <h4>Methods</h4>
          <table>
            <tbody>
              <tr><td><code>GET</code></td><td>read · safe · idempotent</td></tr>
              <tr><td><code>POST</code></td><td>create / action · neither</td></tr>
              <tr><td><code>PUT</code></td><td>replace · idempotent</td></tr>
              <tr><td><code>PATCH</code></td><td>partial update · not guaranteed</td></tr>
              <tr><td><code>DELETE</code></td><td>remove · idempotent</td></tr>
            </tbody>
          </table>
        </section>
        <section>
          <h4>Success</h4>
          <table>
            <tbody>
              <tr><td><code>200</code></td><td>OK, with body</td></tr>
              <tr><td><code>201</code></td><td>Created + <code>Location</code></td></tr>
              <tr><td><code>202</code></td><td>Accepted, finishing later</td></tr>
              <tr><td><code>204</code></td><td>Done, no body</td></tr>
              <tr><td><code>304</code></td><td>Your cached copy is fine</td></tr>
            </tbody>
          </table>
        </section>
        <section>
          <h4>Errors</h4>
          <table>
            <tbody>
              <tr><td><code>400</code></td><td>can’t parse it</td></tr>
              <tr><td><code>401</code></td><td>who are you?</td></tr>
              <tr><td><code>403</code></td><td>not allowed</td></tr>
              <tr><td><code>404</code></td><td>not found</td></tr>
              <tr><td><code>409</code></td><td>conflicts with state</td></tr>
              <tr><td><code>412</code></td><td><code>If-Match</code> failed</td></tr>
              <tr><td><code>422</code></td><td>invalid content</td></tr>
              <tr><td><code>429</code></td><td>slow down</td></tr>
              <tr><td><code>5xx</code></td><td>our fault</td></tr>
            </tbody>
          </table>
        </section>
        <section>
          <h4>Headers worth knowing</h4>
          <table>
            <tbody>
              <tr><td><code>Authorization</code></td><td>Bearer token</td></tr>
              <tr><td><code>Content-Type</code></td><td>what the body is</td></tr>
              <tr><td><code>Location</code></td><td>new resource URL</td></tr>
              <tr><td><code>ETag</code></td><td>version of a representation</td></tr>
              <tr><td><code>If-None-Match</code></td><td>conditional GET → 304</td></tr>
              <tr><td><code>If-Match</code></td><td>safe update → 412</td></tr>
              <tr><td><code>Idempotency-Key</code></td><td>safe POST retries</td></tr>
              <tr><td><code>Retry-After</code></td><td>with 429 / 503</td></tr>
            </tbody>
          </table>
        </section>
        <section>
          <h4>Error body</h4>
          <pre>{`Content-Type: application/problem+json
{
  "type": ".../problems/validation",
  "title": "Invalid fields.",
  "status": 422,
  "detail": "...",
  "instance": ".../req_7Hc2kQ",
  "errors": [{ "pointer", "detail" }]
}`}</pre>
        </section>
        <section>
          <h4>Data conventions</h4>
          <ul>
            <li>Timestamps: RFC 3339 UTC <code>2026-11-17T09:30:00Z</code></li>
            <li>IDs as strings</li>
            <li>Money: minor units + currency</li>
            <li>One naming case, everywhere</li>
            <li>Lists wrapped: <code>{"{ data, next_cursor }"}</code></li>
          </ul>
        </section>
        <section>
          <h4>Pagination</h4>
          <ul>
            <li>Cursor for growing data: <code>?limit=20&amp;cursor=…</code></li>
            <li>Offset for small tables: <code>?limit=20&amp;offset=40</code></li>
            <li>Always cap <code>limit</code> on the server</li>
            <li>Filter and sort on indexed fields only</li>
          </ul>
        </section>
        <section>
          <h4>Before you ship</h4>
          <ul className="pub-ticks">
            <li>Auth on every endpoint, ownership on every object</li>
            <li>Errors share one shape</li>
            <li>Lists paginated and capped</li>
            <li>Side-effect POSTs take an idempotency key</li>
            <li>Rate limits visible</li>
            <li>Change is additive, or versioned</li>
            <li>OpenAPI spec updated</li>
          </ul>
        </section>
      </div>
    </FigureFrame>
  );
}
