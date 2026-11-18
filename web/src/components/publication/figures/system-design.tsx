import { FigureFrame, Tag } from "./frame";
import { SequenceDiagram } from "./sequence-diagram";
import { Bars, Steps, TierDiagram } from "./diagram";

type FigureProps = { number?: number };

/* ------------------------------------------------------------------ */
/* 1. The design loop                                                  */
/* ------------------------------------------------------------------ */

export function SdDesignLoopFigure({ number }: FigureProps) {
  return (
    <FigureFrame
      id="sd-design-loop"
      number={number}
      wide
      title="Six steps that work for an interview and for a real feature"
      caption="Steps 1 to 3 decide which problems are real. Most over-engineering comes from skipping them and designing for numbers nobody wrote down."
    >
      <Steps
        cols={3}
        steps={[
          { title: "Clarify what it must do", body: "Core use cases only, in a sentence each.", tone: "accent" },
          { title: "Clarify the qualities", body: "Users, read/write mix, latency, durability, how stale is acceptable.", tone: "accent" },
          { title: "Estimate the numbers", body: "Requests per second, storage per year, bandwidth. Rough is fine.", tone: "accent" },
          { title: "Draw the simplest thing that works", body: "Often a client, one service and one database.", tone: "positive" },
          { title: "Find what breaks first", body: "Under your numbers, not someone else’s. Fix only that.", tone: "gold" },
          { title: "Name the trade-offs", body: "What you chose, what it costs, what you would revisit at 10×.", tone: "violet" },
        ]}
        loop={
          <>
            <strong>Then loop:</strong> when the numbers change, go back to step 5. A design is a
            snapshot of the constraints you knew about.
          </>
        }
      />
    </FigureFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Latency orders of magnitude                                      */
/* ------------------------------------------------------------------ */

// Bar length is log10(seconds / 10 ns), so each step of one unit is ten times slower.
const LATENCY = [
  { label: "Read from main memory", seconds: 1e-7, display: "~100 ns", human: "1 second" },
  { label: "Random read from an SSD", seconds: 1e-4, display: "~100 µs", human: "about 17 minutes" },
  { label: "Round trip inside one data centre", seconds: 5e-4, display: "~0.5 ms", human: "about 1.4 hours" },
  { label: "Simple indexed query, warm cache", seconds: 1e-3, display: "~1 ms", human: "about 3 hours" },
  { label: "Round trip between continents", seconds: 0.15, display: "~150 ms", human: "about 17 days" },
];

export function SdLatencyFigure({ number }: FigureProps) {
  return (
    <FigureFrame
      id="sd-latency"
      number={number}
      wide
      title="Latency, drawn on a log scale"
      caption={
        <>
          Orders of magnitude, not benchmarks: real numbers depend on hardware, network and load.
          The line under each bar rescales everything so a memory read takes one second, which
          makes the gaps easier to feel. Network distance dominates everything else on the list.
        </>
      }
    >
      <Bars
        max={7.5}
        bars={LATENCY.map((row, i) => ({
          label: row.label,
          value: Math.log10(row.seconds / 1e-8),
          display: row.display,
          note: <>If memory took 1 s: <strong>{row.human}</strong></>,
          tone: i === 0 ? "positive" : i === LATENCY.length - 1 ? "danger" : i === 1 ? "accent" : "gold",
        }))}
        scaleLabel="Scale: logarithmic from 10 ns."
      />

      <div className="pub-grid-3 pub-mt">
        <div className="pub-panel">
          <p className="pub-panel-title">Per day → per second</p>
          <p className="pub-small">86,400 seconds in a day. Divide by 100,000 for a fast estimate.</p>
          <code className="pub-snippet">1 M / day ≈ 12 / s average</code>
        </div>
        <div className="pub-panel">
          <p className="pub-panel-title">Average is not peak</p>
          <p className="pub-small">Traffic follows time zones and events. Size for the peak you measure, or state the multiple you assumed.</p>
          <code className="pub-snippet">peak = average × your assumed factor</code>
        </div>
        <div className="pub-panel">
          <p className="pub-panel-title">Storage per year</p>
          <p className="pub-small">Records per day × bytes per record × 365, then add indexes and replicas.</p>
          <code className="pub-snippet">10 M × 1 KB × 365 ≈ 3.65 TB</code>
        </div>
      </div>
    </FigureFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 3. How a design grows                                               */
/* ------------------------------------------------------------------ */

export function SdScalingPathFigure({ number }: FigureProps) {
  return (
    <FigureFrame
      id="sd-scaling-path"
      number={number}
      wide
      title="How a typical web system grows, one bottleneck at a time"
      caption="Each stage is a response to a measured problem, not a default. Many products run happily at stage 1 or 2 for years; the data tier is usually the last and hardest thing to change."
    >
      <div className="pub-stages">
        <div className="pub-stage">
          <div className="pub-stage-head"><b>1</b><span>One server, one database</span></div>
          <TierDiagram
            compact
            tiers={[
              { nodes: [{ name: "Clients" }], link: "HTTPS" },
              { nodes: [{ name: "App server", sub: "sessions and uploads on local disk", tone: "accent" }] },
              { nodes: [{ name: "Relational database", tone: "violet" }] },
            ]}
          />
          <p className="pub-small pub-stage-note"><strong>Breaks when:</strong> one machine runs out of CPU, or one failure takes everything down.</p>
        </div>
        <div className="pub-stage">
          <div className="pub-stage-head"><b>2</b><span>Stateless app tier</span></div>
          <TierDiagram
            compact
            tiers={[
              { nodes: [{ name: "Clients" }] },
              { nodes: [{ name: "Load balancer", sub: "health checks", added: true }] },
              { nodes: [{ name: "App × N", sub: "no local state", tone: "accent" }] },
              { nodes: [{ name: "Database", tone: "violet" }, { name: "Object storage", sub: "uploads", added: true }, { name: "Shared store", sub: "sessions", added: true }] },
            ]}
          />
          <p className="pub-small pub-stage-note"><strong>Breaks when:</strong> reads overwhelm the database, or slow work blocks requests.</p>
        </div>
        <div className="pub-stage">
          <div className="pub-stage-head"><b>3</b><span>Read-heavy growth</span></div>
          <TierDiagram
            compact
            tiers={[
              { nodes: [{ name: "CDN", sub: "static and public pages", added: true }] },
              { nodes: [{ name: "Load balancer" }] },
              { nodes: [{ name: "App × N", tone: "accent" }, { name: "Workers", sub: "from a queue", added: true, tone: "gold" }] },
              { nodes: [{ name: "Cache", added: true }, { name: "Primary", tone: "violet" }, { name: "Read replicas", added: true, tone: "violet" }] },
            ]}
          />
          <p className="pub-small pub-stage-note"><strong>Next, only if needed:</strong> partitioning, then sharding by a key that matches access.</p>
        </div>
      </div>
    </FigureFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Cache-aside                                                      */
/* ------------------------------------------------------------------ */

export function SdCachingFigure({ number }: FigureProps) {
  return (
    <FigureFrame
      id="sd-caching"
      number={number}
      wide
      title="Cache-aside: read through the cache, invalidate on write"
      caption={
        <>
          The application owns both paths. Deleting the key on write (rather than updating it) is
          the simpler choice because the next read rebuilds it from the source of truth; the TTL
          catches any write path that forgets to invalidate.
        </>
      }
    >
      <SequenceDiagram
        ariaLabel="Cache-aside sequence: a cache miss reads the database and fills the cache; a write updates the database and deletes the cache key"
        participants={[
          { id: "app", label: "Application" },
          { id: "cache", label: "Cache", sub: "Redis, Memcached" },
          { id: "db", label: "Database", sub: "source of truth" },
        ]}
        steps={[
          { from: "app", to: "cache", label: "GET user:42:profile" },
          { from: "cache", to: "app", label: "miss", kind: "response" },
          { from: "app", to: "db", label: "SELECT … WHERE id = 42" },
          { from: "db", to: "app", label: "row", kind: "response" },
          { from: "app", to: "cache", label: "SET user:42:profile", detail: "TTL 300 s, with jitter" },
          { from: "app", to: "app", label: "Later: the user edits their profile" },
          { from: "app", to: "db", label: "UPDATE users SET … WHERE id = 42" },
          { from: "app", to: "cache", label: "DEL user:42:profile", detail: "next read refills it" },
        ]}
      />
      <div className="pub-grid-3 pub-mt">
        <div className="pub-panel">
          <p className="pub-panel-title">Stale data <Tag tone="gold">invalidation</Tag></p>
          <p className="pub-small">A write path that forgets to delete the key serves old data until the TTL expires.</p>
        </div>
        <div className="pub-panel">
          <p className="pub-panel-title">Stampede <Tag tone="gold">expiry</Tag></p>
          <p className="pub-small">A hot key expires and every request rebuilds it at once. Let one request rebuild; jitter TTLs.</p>
        </div>
        <div className="pub-panel">
          <p className="pub-panel-title">Data leak <Tag tone="danger">key design</Tag></p>
          <p className="pub-small">User-specific data under a shared key is served to the wrong user. Put the user or tenant in the key.</p>
        </div>
      </div>
    </FigureFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Replication lag                                                  */
/* ------------------------------------------------------------------ */

export function SdReplicationLagFigure({ number }: FigureProps) {
  return (
    <FigureFrame
      id="sd-replication-lag"
      number={number}
      wide
      title="Replication lag: why a saved change can seem to vanish"
      caption="With asynchronous replication the replica is usually only slightly behind, but “slightly” is long enough for the next page load. Reading a user’s own recent writes from the primary is the usual fix."
    >
      <SequenceDiagram
        ariaLabel="A user saves a change to the primary, reloads, and reads from a replica that has not yet received the change"
        participants={[
          { id: "user", label: "User" },
          { id: "app", label: "Application" },
          { id: "primary", label: "Primary", sub: "takes writes" },
          { id: "replica", label: "Replica", sub: "serves reads" },
        ]}
        steps={[
          { from: "user", to: "app", label: "Save new display name" },
          { from: "app", to: "primary", label: "UPDATE users …" },
          { from: "primary", to: "app", label: "committed", kind: "response" },
          { from: "app", to: "user", label: "200 Saved", kind: "response" },
          { from: "user", to: "app", label: "Reload the page" },
          { from: "app", to: "replica", label: "SELECT … (replica not caught up)" },
          { from: "replica", to: "app", label: "old name", kind: "response" },
          { from: "primary", to: "replica", label: "Change replicates, too late", detail: "asynchronous" },
        ]}
      />
      <div className="pub-grid-2 pub-mt">
        <div className="pub-panel">
          <p className="pub-panel-title">Read your own writes</p>
          <p className="pub-small">After a user writes, route that user’s reads to the primary for a short window, or until the replica reports it has caught up.</p>
        </div>
        <div className="pub-panel">
          <p className="pub-panel-title">Decide per query</p>
          <p className="pub-small">Dashboards, search and feeds tolerate lag. A balance shown right after a payment does not.</p>
        </div>
      </div>
    </FigureFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 6. Outbox pattern                                                   */
/* ------------------------------------------------------------------ */

export function SdOutboxFigure({ number }: FigureProps) {
  return (
    <FigureFrame
      id="sd-outbox"
      number={number}
      wide
      title="The dual-write problem, and the transactional outbox"
      caption="The relay can crash after publishing and before marking the row sent, so the event may be published twice. That is at-least-once delivery: consumers deduplicate by event ID."
    >
      <div className="pub-grid-2">
        <div className="pub-panel">
          <p className="pub-panel-title">Two separate writes <Tag tone="danger">can disagree</Tag></p>
          <ul className="pub-crosses">
            <li>Save the order: committed</li>
            <li>Publish <code>OrderCreated</code>: process crashes first</li>
            <li>The database says the order exists; nothing downstream knows</li>
          </ul>
        </div>
        <div className="pub-panel">
          <p className="pub-panel-title">One transaction <Tag tone="positive">both or neither</Tag></p>
          <ul className="pub-ticks">
            <li>Insert the order and an <code>outbox</code> row together</li>
            <li>A relay publishes outbox rows afterwards</li>
            <li>Retried until the broker acknowledges</li>
          </ul>
        </div>
      </div>
      <div className="pub-mt">
        <SequenceDiagram
          ariaLabel="Outbox pattern: the service writes the order and outbox row in one transaction; a relay reads unsent rows, publishes to the broker and marks them sent"
          participants={[
            { id: "svc", label: "Order service" },
            { id: "db", label: "Database", sub: "orders + outbox" },
            { id: "relay", label: "Relay", sub: "poller or CDC" },
            { id: "broker", label: "Message broker" },
          ]}
          steps={[
            { from: "svc", to: "db", label: "BEGIN · INSERT order · INSERT outbox · COMMIT" },
            { from: "relay", to: "db", label: "Read unsent outbox rows" },
            { from: "db", to: "relay", label: "OrderCreated, event_id 9f1c", kind: "response" },
            { from: "relay", to: "broker", label: "Publish OrderCreated" },
            { from: "broker", to: "relay", label: "ack", kind: "response" },
            { from: "relay", to: "db", label: "Mark row sent" },
          ]}
        />
      </div>
    </FigureFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 7. Retries, backoff and circuit breakers                            */
/* ------------------------------------------------------------------ */

export function SdRetriesFigure({ number }: FigureProps) {
  return (
    <FigureFrame
      id="sd-retries"
      number={number}
      wide
      title="Retries multiply, backoff spreads them, breakers stop them"
      caption={
        <>
          Delays follow the code in this chapter: <code>min(cap, base × 2ⁿ)</code> with base 0.2 s
          and cap 5 s, and “full jitter” sleeps a random time between zero and that ceiling so
          clients that failed together do not retry together.
        </>
      }
    >
      <div className="pub-grid-2">
        <div className="pub-panel">
          <p className="pub-panel-title">Three layers, three attempts each</p>
          <Bars
            max={27}
            bars={[
              { label: "Gateway → API", value: 3, display: "3 calls", tone: "accent" },
              { label: "API → service", value: 9, display: "9 calls", tone: "gold" },
              { label: "Service → database", value: 27, display: "27 calls", tone: "danger" },
            ]}
          />
          <p className="pub-small">One failing request at the bottom becomes 27 calls. Retry at one layer, usually the one closest to the caller.</p>
        </div>
        <div className="pub-panel">
          <p className="pub-panel-title">Backoff ceiling before each retry (5 attempts)</p>
          <Bars
            max={2}
            bars={[0.2, 0.4, 0.8, 1.6].map((s, i) => ({
              label: `Retry ${i + 1}`,
              value: s,
              display: `≤ ${s} s`,
              tone: "violet" as const,
            }))}
          />
          <p className="pub-small">Each sleep is random in [0, ceiling]. Only retry idempotent operations, or send an idempotency key.</p>
        </div>
      </div>

      <div className="pub-panel pub-mt">
        <p className="pub-panel-title">Circuit breaker states</p>
        <div className="pub-states">
          <div className="pub-state pub-tone-positive">
            <p className="pub-state-name">Closed</p>
            <p className="pub-small">Calls go through. Failures are counted.</p>
          </div>
          <div className="pub-state pub-tone-danger">
            <p className="pub-state-name">Open</p>
            <p className="pub-small">Calls fail fast or use a fallback. The dependency gets time to recover.</p>
          </div>
          <div className="pub-state pub-tone-gold">
            <p className="pub-state-name">Half-open</p>
            <p className="pub-small">A few trial calls are let through to test recovery.</p>
          </div>
        </div>
        <ul className="pub-transitions">
          <li><span>Closed → Open</span><span>failure rate or count crosses a threshold</span></li>
          <li><span>Open → Half-open</span><span>a cool-down timer expires</span></li>
          <li><span>Half-open → Closed</span><span>trial calls succeed</span></li>
          <li><span>Half-open → Open</span><span>a trial call fails</span></li>
        </ul>
      </div>
    </FigureFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 8. Consistency per feature                                          */
/* ------------------------------------------------------------------ */

export function SdConsistencyFigure({ number }: FigureProps) {
  return (
    <FigureFrame
      id="sd-consistency"
      number={number}
      wide
      title="Choose consistency per feature, not per system"
      caption="CAP describes the choice during a network partition. PACELC adds the everyday case: else, when the network is fine, you still trade latency against consistency."
    >
      <div className="pub-grid-2">
        <div className="pub-panel">
          <p className="pub-panel-title">Needs strong consistency <Tag tone="violet">correct first</Tag></p>
          <ul className="pub-ticks">
            <li>Account balances and payments</li>
            <li>Inventory and seat booking</li>
            <li>Unique usernames, permissions changes</li>
          </ul>
          <p className="pub-small">Synchronous writes, transactions, reads from the primary. Slower, and may refuse requests during a partition.</p>
        </div>
        <div className="pub-panel">
          <p className="pub-panel-title">Eventual is fine <Tag tone="accent">fast first</Tag></p>
          <ul className="pub-ticks">
            <li>Like and view counts</li>
            <li>Feeds, recommendations, search results</li>
            <li>Analytics and dashboards</li>
          </ul>
          <p className="pub-small">Asynchronous replication, caches, queues. Fast and available, briefly stale.</p>
        </div>
      </div>
      <div className="pub-compare is-neutral pub-mt" role="table" aria-label="CAP and PACELC">
        <div role="row" className="pub-compare-head"><span>Situation</span><span>Favour consistency</span><span>Favour the other side</span></div>
        <div role="row"><span>Network partition (CAP)</span><span>Refuse or delay some requests</span><span>Stay available, reconcile later</span></div>
        <div role="row"><span>Normal operation (PACELC)</span><span>Wait for replicas: higher latency</span><span>Answer locally: lower latency</span></div>
      </div>
    </FigureFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 9. Worked example: URL shortener                                    */
/* ------------------------------------------------------------------ */

export function SdUrlShortenerFigure({ number }: FigureProps) {
  return (
    <FigureFrame
      id="sd-url-shortener"
      number={number}
      wide
      title="Worked example: a URL shortener at 100 million redirects a day"
      caption="Numbers are the stated assumptions of the example, rounded. The design answers the measured bottleneck (reads, 100 to 1) and stops: no sharding, no extra services."
    >
      <div className="pub-annotated">
        <TierDiagram
          compact
          tiers={[
            { nodes: [{ name: "Clients" }], link: "GET /{code} · POST /links" },
            { nodes: [{ name: "Load balancer" }] },
            { nodes: [{ name: "Shortener API × 2+", sub: "stateless", tone: "accent" }] },
            {
              nodes: [
                { name: "Redis", sub: "code → URL, long TTL", tone: "positive" },
                { name: "Postgres", sub: "primary + replica", tone: "violet" },
                { name: "Queue → worker", sub: "click counts", tone: "gold" },
              ],
            },
          ]}
        />
        <div>
          <p className="pub-panel-title">Back of the envelope</p>
          <dl className="pub-kv pub-mt">
            <dt>writes</dt><dd>1 M links / day ≈ 12 / s</dd>
            <dt>reads</dt><dd>100 M redirects / day ≈ 1,160 / s</dd>
            <dt>peak</dt><dd>assume 4 × average ≈ 4,600 reads / s</dd>
            <dt>storage</dt><dd>&lt; 1 KB × 1 M / day ≈ 365 GB / year</dd>
            <dt>codes</dt><dd>base62, 7 characters: 62⁷ ≈ 3.5 trillion</dd>
          </dl>
          <p className="pub-panel-title pub-mt">Decisions</p>
          <ul className="pub-ticks pub-mt">
            <li>Cache-aside on the redirect path</li>
            <li><code>302</code> so every click reaches you, if counts matter</li>
            <li>Clicks go to a queue, never a write per redirect</li>
            <li>Replicas only if cache misses strain the primary</li>
          </ul>
        </div>
      </div>
    </FigureFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 10. Quick reference                                                 */
/* ------------------------------------------------------------------ */

export function SdQuickReferenceFigure({ number }: FigureProps) {
  return (
    <FigureFrame id="sd-quick-reference" number={number} wide title="System design quick reference">
      <div className="pub-qr">
        <section>
          <h4>The loop</h4>
          <ul>
            <li>1 · What must it do?</li>
            <li>2 · Qualities: scale, latency, durability</li>
            <li>3 · Estimate the numbers</li>
            <li>4 · Simplest design that works</li>
            <li>5 · What breaks first?</li>
            <li>6 · Name the trade-offs</li>
          </ul>
        </section>
        <section>
          <h4>Numbers</h4>
          <table>
            <tbody>
              <tr><td>memory read</td><td>~100 ns</td></tr>
              <tr><td>SSD random read</td><td>~100 µs</td></tr>
              <tr><td>same-DC round trip</td><td>~0.5 ms</td></tr>
              <tr><td>indexed query</td><td>~1 ms</td></tr>
              <tr><td>cross-continent</td><td>~100 to 200 ms</td></tr>
              <tr><td>1 M / day</td><td>≈ 12 / s</td></tr>
            </tbody>
          </table>
        </section>
        <section>
          <h4>Scale the app tier</h4>
          <ul>
            <li>Stateless instances behind a load balancer</li>
            <li>Sessions in a shared store or signed tokens</li>
            <li>Files in object storage</li>
            <li>Health checks that really serve a request</li>
          </ul>
        </section>
        <section>
          <h4>Scale the data</h4>
          <table>
            <tbody>
              <tr><td>slow query</td><td>index, read <code>EXPLAIN</code></td></tr>
              <tr><td>read-heavy</td><td>cache, then replicas</td></tr>
              <tr><td>huge table</td><td>partition</td></tr>
              <tr><td>one DB not enough</td><td>shard, last</td></tr>
              <tr><td>counters, stock</td><td>atomic <code>UPDATE</code></td></tr>
            </tbody>
          </table>
        </section>
        <section>
          <h4>Caching</h4>
          <ul>
            <li>Ask: how stale can this be?</li>
            <li>Cache-aside, delete on write, TTL as a net</li>
            <li>Jitter TTLs, one rebuilder per key</li>
            <li>User or tenant in every private key</li>
            <li>Watch the hit rate</li>
          </ul>
        </section>
        <section>
          <h4>Queues</h4>
          <ul>
            <li>Delivery is usually at-least-once</li>
            <li>Consumers must be idempotent</li>
            <li>Dead-letter queue for poison messages</li>
            <li>Alert on depth and oldest message age</li>
            <li>Outbox for “save and publish”</li>
          </ul>
        </section>
        <section>
          <h4>Reliability</h4>
          <ul>
            <li>Timeout on every network call</li>
            <li>Retry once per stack, backoff + jitter</li>
            <li>Circuit breaker on flaky dependencies</li>
            <li>Plan the degraded experience</li>
            <li>Test restores, not just backups</li>
          </ul>
        </section>
        <section>
          <h4>Consistency</h4>
          <table>
            <tbody>
              <tr><td>money, stock, seats</td><td>strong</td></tr>
              <tr><td>counts, feeds, search</td><td>eventual</td></tr>
              <tr><td>after a user’s write</td><td>read from primary</td></tr>
            </tbody>
          </table>
        </section>
        <section>
          <h4>Defaults to start from</h4>
          <ul className="pub-ticks">
            <li>Modular monolith</li>
            <li>One relational database</li>
            <li>Managed services where they fit</li>
            <li>SLOs on user-facing symptoms</li>
            <li>Write down why</li>
          </ul>
        </section>
      </div>
    </FigureFrame>
  );
}
