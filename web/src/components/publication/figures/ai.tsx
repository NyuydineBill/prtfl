import { FigureFrame, MarkCell, Tag, type Mark } from "./frame";
import { SequenceDiagram } from "./sequence-diagram";
import { Bars, Steps, TierDiagram } from "./diagram";

type FigureProps = { number?: number };

/* ------------------------------------------------------------------ */
/* 1. The AI service layer                                             */
/* ------------------------------------------------------------------ */

export function AiServiceLayerFigure({ number }: FigureProps) {
  return (
    <FigureFrame
      id="ai-service-layer"
      number={number}
      wide
      title="The model is a dependency behind one seam"
      caption="Everything above the seam asks for a typed result (a Summary, a Classification) and never sees a provider, a model name or a prompt. Everything that makes a model call production-grade lives in that one layer."
    >
      <TierDiagram
        tiers={[
          { label: "Product", nodes: [{ name: "Web app" }, { name: "Mobile app" }, { name: "Internal tools" }], link: "your API" },
          { label: "Application", nodes: [{ name: "API handlers", tone: "accent" }, { name: "Background workers", tone: "accent" }], link: "summarize(text) → Summary" },
          {
            label: "AI service layer",
            nodes: [
              { name: "Prompt templates", sub: "versioned in git", tone: "violet" },
              { name: "Input checks", sub: "validate, trim to budget", tone: "violet" },
              { name: "Output checks", sub: "schema validation", tone: "violet" },
              { name: "Resilience", sub: "timeouts, retries, fallback", tone: "violet" },
              { name: "Telemetry", sub: "logs, latency, tokens, cost", tone: "violet" },
            ],
            link: "provider SDK or HTTP",
          },
          {
            label: "External",
            nodes: [
              { name: "Primary model", dashed: true },
              { name: "Fallback model", dashed: true },
              { name: "Retrieval index", sub: "your documents", dashed: true },
            ],
          },
        ]}
      />
      <div className="pub-grid-3 pub-mt">
        <div className="pub-panel">
          <p className="pub-panel-title">Swap providers</p>
          <p className="pub-small">A model or vendor change touches one module and is judged by the same evaluation set.</p>
        </div>
        <div className="pub-panel">
          <p className="pub-panel-title">Test without a model</p>
          <p className="pub-small">Feature code is tested against a fake that returns typed results, fast and free.</p>
        </div>
        <div className="pub-panel">
          <p className="pub-panel-title">One place for limits</p>
          <p className="pub-small">Token budgets, per-tenant quotas and the kill switch are enforced once.</p>
        </div>
      </div>
    </FigureFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 2. One model call, end to end                                       */
/* ------------------------------------------------------------------ */

export function AiRequestPathFigure({ number }: FigureProps) {
  return (
    <FigureFrame
      id="ai-request-path"
      number={number}
      wide
      title="One model call, from feature code to a validated result"
      caption="The retry with the validation error is bounded to one attempt. If that also fails, the layer returns a fallback instead of an exception the feature has to understand."
    >
      <SequenceDiagram
        ariaLabel="Sequence of a model call: input checks, a call with timeout and schema, output validation, one retry, and a typed result"
        participants={[
          { id: "feature", label: "Feature code" },
          { id: "layer", label: "AI service layer" },
          { id: "model", label: "Model provider", sub: "external" },
        ]}
        steps={[
          { from: "feature", to: "layer", label: "summarize(text)" },
          { from: "layer", to: "layer", label: "Validate input, trim to budget", detail: "render prompt summarize@v13" },
          { from: "layer", to: "model", label: "Generate", detail: "timeout 20 s · max output tokens · JSON schema" },
          { from: "model", to: "layer", label: "Response", kind: "response" },
          { from: "layer", to: "layer", label: "Parse and validate against schema", detail: "invalid → one retry" },
          { from: "layer", to: "model", label: "Retry with the validation error" },
          { from: "model", to: "layer", label: "Valid JSON", kind: "response" },
          { from: "layer", to: "feature", label: "Summary(title, bullets, confidence)", detail: "logged: model, prompt version, tokens, cost, latency", kind: "response" },
        ]}
      />
      <div className="pub-panel pub-mt">
        <p className="pub-panel-title">If it still fails, degrade in this order</p>
        <p className="pub-ai-chain">
          <Tag tone="accent">secondary model</Tag>
          <span aria-hidden>→</span>
          <Tag tone="violet">non-AI fallback (rules, keyword search)</Tag>
          <span aria-hidden>→</span>
          <Tag tone="gold">honest message, original content shown</Tag>
        </p>
      </div>
    </FigureFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Evaluation loop                                                  */
/* ------------------------------------------------------------------ */

const EVAL_ROWS: { metric: string; before: string; after: string; verdict: "ok" | "warn" | "fail"; note: string }[] = [
  { metric: "Classification accuracy", before: "0.91", after: "0.94", verdict: "ok", note: "above 0.90 threshold" },
  { metric: "Schema validity", before: "1.00", after: "1.00", verdict: "ok", note: "must stay at 1.00" },
  { metric: "Latency p50", before: "1.8 s", after: "2.1 s", verdict: "warn", note: "within budget, review" },
  { metric: "Cost per call", before: "$0.0021", after: "$0.0024", verdict: "warn", note: "+14%, review" },
  { metric: "Regressions", before: "", after: "2 examples", verdict: "fail", note: "read before merging" },
];

export function AiEvalLoopFigure({ number }: FigureProps) {
  return (
    <FigureFrame
      id="ai-eval-loop"
      number={number}
      wide
      title="Evaluation as a gate, fed by production"
      caption="The report values are illustrative. Thresholds are yours to set per metric; the point is that a prompt, model or retrieval change does not merge without a report like this attached."
    >
      <Steps
        cols={3}
        steps={[
          { title: "Collect real examples", body: "Anonymised. Typical, edge, past failures, adversarial.", tone: "accent" },
          { title: "Define “good”", body: "An exact answer where possible, a rubric where not.", tone: "accent" },
          { title: "Change one thing", body: "Prompt, model, retrieval setting or parser.", tone: "violet" },
          { title: "Run the suite in CI", body: "Score every example with the method that fits the task.", tone: "violet" },
          { title: "Gate the merge", body: "Fail below threshold. Read every regression.", tone: "gold" },
          { title: "Ship behind a flag", body: "Watch feedback, validation failures and cost.", tone: "positive" },
        ]}
        loop={<><strong>Then loop:</strong> production failures, complaints and thumbs-down examples become new rows in step 1.</>}
      />
      <div className="pub-evalreport pub-mt" role="table" aria-label="Example evaluation report for a prompt change">
        <div role="row" className="pub-evalreport-head">
          <span>prompt v12 → v13</span><span>v12</span><span>v13</span><span />
        </div>
        {EVAL_ROWS.map((row) => (
          <div role="row" key={row.metric}>
            <span>{row.metric}</span>
            <span className="pub-mono">{row.before}</span>
            <span className="pub-mono">{row.after}</span>
            <span>
              <Tag tone={row.verdict === "ok" ? "positive" : row.verdict === "warn" ? "gold" : "danger"}>
                {row.verdict === "ok" ? "pass" : row.verdict === "warn" ? "check" : "blocker"}
              </Tag>{" "}
              <span className="pub-small">{row.note}</span>
            </span>
          </div>
        ))}
      </div>
    </FigureFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Latency                                                          */
/* ------------------------------------------------------------------ */

export function AiLatencyFigure({ number }: FigureProps) {
  return (
    <FigureFrame
      id="ai-latency"
      number={number}
      wide
      title="Where the waiting goes, and the two cheapest fixes"
      caption="Timings are illustrative, chosen to show the shape. Measure time to first token and total time separately: users feel the first, your infrastructure pays for the second."
    >
      <div className="pub-grid-2">
        <div className="pub-panel">
          <p className="pub-panel-title">Streaming changes what users wait for</p>
          <Bars
            max={6}
            bars={[
              { label: "Not streamed: first visible text", value: 6, display: "6.0 s", tone: "danger" },
              { label: "Streamed: first visible text", value: 0.8, display: "0.8 s", tone: "positive" },
              { label: "Streamed: complete", value: 6, display: "6.0 s", tone: "muted" },
            ]}
          />
          <p className="pub-small">Same model, same total work. The person starts reading after the first tokens.</p>
        </div>
        <div className="pub-panel">
          <p className="pub-panel-title">Independent calls should not queue</p>
          <Bars
            max={4.5}
            bars={[
              { label: "Three calls in a chain", value: 4.5, display: "4.5 s", tone: "danger" },
              { label: "Same three in parallel", value: 1.5, display: "1.5 s", tone: "positive" },
            ]}
          />
          <p className="pub-small">Only chain calls when one genuinely needs the previous result.</p>
        </div>
      </div>
    </FigureFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Failure handling matrix                                          */
/* ------------------------------------------------------------------ */

const FAILURES: { failure: string; retry: Mark; retryText: string; then: string; user: string }[] = [
  { failure: "Timeout or 5xx", retry: "yes", retryText: "1 to 2×, backoff", then: "Fallback model or path", user: "A slightly slower answer" },
  { failure: "429 rate limited", retry: "yes", retryText: "After Retry-After", then: "Queue bulk work", user: "Nothing, if queued" },
  { failure: "Output fails schema", retry: "yes", retryText: "Once, with the error", then: "Fallback", user: "A result or a clear message" },
  { failure: "Valid, low confidence", retry: "no", retryText: "No", then: "Human review or caveat", user: "A labelled, checkable result" },
  { failure: "Provider outage", retry: "no", retryText: "No", then: "Switch provider or degrade", user: "Reduced feature, not an error" },
  { failure: "Request refused", retry: "no", retryText: "No", then: "Log, check for false refusal", user: "A helpful explanation" },
];

export function AiFailuresFigure({ number }: FigureProps) {
  return (
    <FigureFrame
      id="ai-failures"
      number={number}
      wide
      title="Plan each failure before it happens"
      caption="Every row ends with something the user can work with. The kill switch sits above all of them: one flag turns the feature off without a deploy."
    >
      <div className="pub-matrix" role="table" aria-label="Model failures and responses" style={{ "--matrix-cols": "1.3fr 1fr 1.3fr 1.4fr" } as React.CSSProperties}>
        <div className="pub-matrix-row pub-matrix-head" role="row">
          <span role="columnheader">Failure</span>
          <span role="columnheader">Retry?</span>
          <span role="columnheader">Then</span>
          <span role="columnheader">User sees</span>
        </div>
        {FAILURES.map((f) => (
          <div className="pub-matrix-row" role="row" key={f.failure}>
            <span role="cell" className="pub-matrix-method"><strong className="pub-ink">{f.failure}</strong></span>
            <span role="cell" data-label="Retry?"><MarkCell mark={f.retry} label="Retry" text={f.retryText} /></span>
            <span role="cell" data-label="Then">{f.then}</span>
            <span role="cell" data-label="User sees">{f.user}</span>
          </div>
        ))}
      </div>
    </FigureFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 6. Trust boundary for tools                                         */
/* ------------------------------------------------------------------ */

export function AiTrustBoundaryFigure({ number }: FigureProps) {
  return (
    <FigureFrame
      id="ai-trust-boundary"
      number={number}
      wide
      title="Prompt injection: limit what a manipulated model can do"
      caption="Any text the model reads can carry instructions (OWASP LLM01). Prompting reduces the risk but cannot remove it, so the enforcement layer is ordinary code that runs with the current user’s permissions."
    >
      <TierDiagram
        tiers={[
          {
            label: "Untrusted text",
            nodes: [
              { name: "User messages", dashed: true, tone: "danger" },
              { name: "Uploaded documents", dashed: true, tone: "danger" },
              { name: "Web pages, emails", dashed: true, tone: "danger" },
              { name: "Tool results", dashed: true, tone: "danger" },
            ],
            link: "may contain instructions",
          },
          { label: "Model", nodes: [{ name: "Model", sub: "proposes text and tool calls", tone: "violet" }], link: "proposals, not actions" },
          {
            label: "Your code",
            nodes: [
              { name: "Tool allowlist", sub: "narrowest set per feature", tone: "positive" },
              { name: "Permission check", sub: "as the signed-in user", tone: "positive" },
              { name: "Confirmation", sub: "before send, delete, pay", tone: "positive" },
              { name: "Output handling", sub: "escape, never execute", tone: "positive" },
            ],
            link: "only then",
          },
          { label: "Effects", nodes: [{ name: "Read data" }, { name: "Send a message" }, { name: "Change records" }, { name: "Render to a page" }] },
        ]}
      />
    </FigureFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 7. Gradual rollout                                                  */
/* ------------------------------------------------------------------ */

export function AiRolloutFigure({ number }: FigureProps) {
  return (
    <FigureFrame
      id="ai-rollout"
      number={number}
      wide
      title="Roll out in stages, with a gate between each"
      caption="Percentages are examples. What matters is that each stage has a named metric to compare against the last one, and that the kill switch works at every stage."
    >
      <ol className="pub-timeline">
        <li className="pub-tone-violet">
          <span className="pub-timeline-dot" />
          <p className="pub-timeline-when">Stage 1</p>
          <p className="pub-timeline-what">Internal users</p>
          <p className="pub-small">Staff use it for real work and report failures into the evaluation set.</p>
        </li>
        <li className="pub-tone-accent">
          <span className="pub-timeline-dot" />
          <p className="pub-timeline-when">Stage 2</p>
          <p className="pub-timeline-what">A small slice of users</p>
          <p className="pub-small">For example 1 to 5%. Compare feedback, errors and cost against stage 1.</p>
        </li>
        <li className="pub-tone-gold">
          <span className="pub-timeline-dot" />
          <p className="pub-timeline-when">Stage 3</p>
          <p className="pub-timeline-what">Wider rollout</p>
          <p className="pub-small">Check performance across languages, regions and user groups, not just the average.</p>
        </li>
        <li className="pub-tone-positive">
          <span className="pub-timeline-dot" />
          <p className="pub-timeline-when">Stage 4</p>
          <p className="pub-timeline-what">Everyone</p>
          <p className="pub-small">Keep the flag. Model and provider changes restart at stage 1.</p>
        </li>
      </ol>
    </FigureFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 8. Quick reference                                                  */
/* ------------------------------------------------------------------ */

export function AiQuickReferenceFigure({ number }: FigureProps) {
  return (
    <FigureFrame id="ai-quick-reference" number={number} wide title="AI in production quick reference">
      <div className="pub-qr">
        <section>
          <h4>Architecture</h4>
          <ul>
            <li>One internal interface for every model call</li>
            <li>Typed results in, typed results out</li>
            <li>Model treated as a slow, fallible dependency</li>
            <li>Kill switch per feature</li>
          </ul>
        </section>
        <section>
          <h4>Prompts</h4>
          <ul>
            <li>In git, versioned, reviewed</li>
            <li>Version logged with every call</li>
            <li>Instructions separated from user content</li>
            <li>No secrets: assume the prompt leaks</li>
          </ul>
        </section>
        <section>
          <h4>Every call has</h4>
          <table>
            <tbody>
              <tr><td>timeout</td><td>from the UX, not the SDK default</td></tr>
              <tr><td>input budget</td><td>trim, chunk, hard max</td></tr>
              <tr><td>output cap</td><td>max tokens</td></tr>
              <tr><td>schema</td><td>structured output, validated</td></tr>
              <tr><td>fallback</td><td>never an endless spinner</td></tr>
            </tbody>
          </table>
        </section>
        <section>
          <h4>Evaluation</h4>
          <ul>
            <li>Golden set of real, anonymised examples</li>
            <li>Edge cases, past failures, attacks</li>
            <li>Score to fit the task; calibrate judges</li>
            <li>Runs in CI, blocks regressions</li>
            <li>Production failures fed back in</li>
          </ul>
        </section>
        <section>
          <h4>Monitor</h4>
          <ul>
            <li>Latency p50 / p95 / p99, first token and total</li>
            <li>Errors, fallbacks, validation failures</li>
            <li>Tokens and cost per feature and tenant</li>
            <li>Feedback: ratings, edits, regenerations</li>
          </ul>
        </section>
        <section>
          <h4>Latency</h4>
          <table>
            <tbody>
              <tr><td>1</td><td>stream the output</td></tr>
              <tr><td>2</td><td>smaller model where evals allow</td></tr>
              <tr><td>3</td><td>shorter prompt, prompt caching</td></tr>
              <tr><td>4</td><td>cache identical requests</td></tr>
              <tr><td>5</td><td>parallelise, precompute</td></tr>
            </tbody>
          </table>
        </section>
        <section>
          <h4>Security</h4>
          <ul>
            <li>All model input is untrusted</li>
            <li>Least-privilege tools, checked in code</li>
            <li>Confirm consequential actions</li>
            <li>Escape output; never run it as code or SQL</li>
          </ul>
        </section>
        <section>
          <h4>Responsible use</h4>
          <ul>
            <li>A person decides high-stakes outcomes</li>
            <li>Label AI output and bots</li>
            <li>Evaluate per user group</li>
            <li>Users can edit, reject, report</li>
            <li>One page documents each feature</li>
          </ul>
        </section>
        <section>
          <h4>Before launch</h4>
          <ul className="pub-ticks">
            <li>Evals in CI</li>
            <li>Dashboards and alerts</li>
            <li>Rate and spend limits per user</li>
            <li>Logging follows privacy rules</li>
            <li>Staged rollout plan</li>
          </ul>
        </section>
      </div>
    </FigureFrame>
  );
}
