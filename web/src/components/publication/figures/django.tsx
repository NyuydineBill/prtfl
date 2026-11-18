import { FigureFrame, Tag } from "./frame";
import { SequenceDiagram } from "./sequence-diagram";
import { Steps, TierDiagram } from "./diagram";

type FigureProps = { number?: number };

/* ------------------------------------------------------------------ */
/* 1. Request cycle through Django and DRF                             */
/* ------------------------------------------------------------------ */

export function DjRequestCycleFigure({ number }: FigureProps) {
  return (
    <FigureFrame
      id="dj-request-cycle"
      number={number}
      wide
      title="One API request through Django and DRF"
      caption={
        <>
          Middleware runs in the order listed in <code>MIDDLEWARE</code> on the way in and in
          reverse on the way out. DRF views are exempt from <code>CsrfViewMiddleware</code>;{" "}
          <code>SessionAuthentication</code> enforces CSRF itself for session-authenticated
          requests.
        </>
      }
    >
      <SequenceDiagram
        ariaLabel="Sequence of a PATCH request through Django middleware, a DRF viewset, a service function and the database"
        participants={[
          { id: "client", label: "Client" },
          { id: "mw", label: "Middleware", sub: "settings.MIDDLEWARE" },
          { id: "view", label: "DRF ViewSet", sub: "views.py" },
          { id: "svc", label: "Service + ORM", sub: "services.py" },
          { id: "db", label: "Database" },
        ]}
        steps={[
          { from: "client", to: "mw", label: "PATCH request", detail: "/api/projects/site-relaunch/" },
          { from: "mw", to: "mw", label: "Security, sessions, auth middleware", detail: "request.user available" },
          { from: "mw", to: "view", label: "URL resolved", detail: "→ partial_update" },
          { from: "view", to: "view", label: "Authenticate → permissions → throttles", detail: "401 / 403 / 429 exit here" },
          { from: "view", to: "view", label: "get_object() from get_queryset()", detail: "scoped to user · 404 · object permission 403" },
          { from: "view", to: "view", label: "serializer.is_valid()", detail: "400 with field errors" },
          { from: "view", to: "svc", label: "update_project()" },
          { from: "svc", to: "db", label: "UPDATE …", detail: "in transaction.atomic" },
          { from: "db", to: "svc", label: "committed", kind: "response" },
          { from: "svc", to: "view", label: "project", kind: "response" },
          { from: "view", to: "client", label: "200 OK · serializer.data", detail: "back out through middleware", kind: "response" },
        ]}
      />
    </FigureFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Where code lives                                                 */
/* ------------------------------------------------------------------ */

export function DjLayersFigure({ number }: FigureProps) {
  return (
    <FigureFrame
      id="dj-layers"
      number={number}
      wide
      title="Thin entry points, business rules in services"
      caption="Every entry point calls the same service functions, so a rule written once applies to the API, the admin, a scheduled task and a management command alike. The database enforces what it can as a last line of defence."
    >
      <TierDiagram
        tiers={[
          {
            label: "Entry points",
            nodes: [
              { name: "Views, ViewSets", sub: "HTTP in, HTTP out", tone: "accent" },
              { name: "Serializers", sub: "validate and shape data", tone: "accent" },
              { name: "Tasks", sub: "Celery, RQ, django.tasks", tone: "accent" },
              { name: "Commands, admin", sub: "manage.py, actions", tone: "accent" },
            ],
            link: "call",
          },
          {
            label: "Domain",
            nodes: [
              { name: "services.py", sub: "writes and business rules", tone: "violet" },
              { name: "selectors.py", sub: "complex reads", tone: "violet" },
            ],
            link: "use",
          },
          {
            label: "Data access",
            nodes: [{ name: "Models, QuerySets, managers", sub: "Project.objects.for_user(u).active()", tone: "gold" }],
            link: "SQL",
          },
          {
            label: "Database",
            nodes: [{ name: "PostgreSQL", sub: "UniqueConstraint, CheckConstraint, foreign keys", tone: "positive" }],
          },
        ]}
      />
    </FigureFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 3. N+1 queries                                                      */
/* ------------------------------------------------------------------ */

function QueryTiles({ count, extra }: { count: number; extra: number }) {
  return (
    <div className="pub-qtiles" aria-hidden>
      {Array.from({ length: count + extra }, (_, i) => (
        <span key={i} className={i < count ? "is-main" : "is-extra"} />
      ))}
    </div>
  );
}

export function DjNPlusOneFigure({ number }: FigureProps) {
  return (
    <FigureFrame
      id="dj-n-plus-one"
      number={number}
      wide
      title="Listing 20 projects with their owner and tasks"
      caption={
        <>
          Each square is one SQL query. The naive version runs one query for the list, then one
          per row for each relation it touches. Assert the count in tests with{" "}
          <code>assertNumQueries</code> or pytest-django&apos;s{" "}
          <code>django_assert_max_num_queries</code>, so the fix stays fixed.
        </>
      }
    >
      <div className="pub-grid-3">
        <div className="pub-panel">
          <p className="pub-panel-title">Naive <Tag tone="danger">41 queries</Tag></p>
          <QueryTiles count={1} extra={40} />
          <code className="pub-snippet">Project.objects.all()</code>
          <p className="pub-small">1 for projects, 20 for <code>p.owner</code>, 20 for <code>p.tasks.all()</code>. Grows with every row.</p>
        </div>
        <div className="pub-panel">
          <p className="pub-panel-title">Forward relation joined <Tag tone="gold">21 queries</Tag></p>
          <QueryTiles count={1} extra={20} />
          <code className="pub-snippet">.select_related(&quot;owner&quot;)</code>
          <p className="pub-small">Owners arrive in the same query through a JOIN. Tasks still load one project at a time.</p>
        </div>
        <div className="pub-panel">
          <p className="pub-panel-title">Both fixed <Tag tone="positive">2 queries</Tag></p>
          <QueryTiles count={2} extra={0} />
          <code className="pub-snippet">.select_related(&quot;owner&quot;).prefetch_related(&quot;tasks&quot;)</code>
          <p className="pub-small">One JOIN for owners, one <code>WHERE project_id IN (…)</code> for all tasks. Constant at any page size.</p>
        </div>
      </div>
      <div className="pub-compare is-neutral pub-mt" role="table" aria-label="select_related and prefetch_related compared">
        <div role="row" className="pub-compare-head"><span>Relation</span><span>Use</span><span>SQL</span></div>
        <div role="row"><span>ForeignKey, OneToOne (forward)</span><span><code>select_related()</code></span><span>JOIN in the same query</span></div>
        <div role="row"><span>Reverse FK, ManyToMany</span><span><code>prefetch_related()</code></span><span>One extra query per relation</span></div>
        <div role="row"><span>Filtered or trimmed related set</span><span><code>Prefetch(&quot;tasks&quot;, queryset=…)</code></span><span>One extra query, your queryset</span></div>
      </div>
    </FigureFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Lost update                                                      */
/* ------------------------------------------------------------------ */

export function DjLostUpdateFigure({ number }: FigureProps) {
  return (
    <FigureFrame
      id="dj-lost-update"
      number={number}
      wide
      title="Read, modify, write: how the last item sells twice"
      caption={
        <>
          Both requests read before either writes, so both see one item left. An{" "}
          <code>F()</code> expression moves the arithmetic into a single SQL statement, and the{" "}
          <code>stock__gt=0</code> filter makes the second request update zero rows instead of
          going negative.
        </>
      }
    >
      <SequenceDiagram
        ariaLabel="Two concurrent requests both read stock 1, both write stock 0, and the last item is sold twice"
        participants={[
          { id: "a", label: "Request A" },
          { id: "db", label: "Database", sub: "stock = 1" },
          { id: "b", label: "Request B" },
        ]}
        steps={[
          { from: "a", to: "db", label: "product = Product.objects.get(pk=7)" },
          { from: "db", to: "a", label: "stock = 1", kind: "response" },
          { from: "b", to: "db", label: "product = Product.objects.get(pk=7)" },
          { from: "db", to: "b", label: "stock = 1", kind: "response" },
          { from: "a", to: "db", label: "product.stock -= 1; save()", detail: "UPDATE … SET stock = 0" },
          { from: "b", to: "db", label: "product.stock -= 1; save()", detail: "UPDATE … SET stock = 0 (sold twice)" },
        ]}
      />
      <div className="pub-grid-2 pub-mt">
        <div className="pub-panel">
          <p className="pub-panel-title">Atomic update <Tag tone="positive">one statement</Tag></p>
          <code className="pub-snippet">{`sold = Product.objects.filter(pk=7, stock__gt=0).update(stock=F("stock") - 1)`}</code>
          <p className="pub-small"><code>sold</code> is 1 for the winner and 0 for the loser, who can show “out of stock”.</p>
        </div>
        <div className="pub-panel">
          <p className="pub-panel-title">Row lock <Tag tone="violet">several fields</Tag></p>
          <code className="pub-snippet">{`with transaction.atomic(): Product.objects.select_for_update().get(pk=7)`}</code>
          <p className="pub-small">The second request waits until the first commits, then reads the new value.</p>
        </div>
      </div>
    </FigureFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 5. DRF permission ladder                                            */
/* ------------------------------------------------------------------ */

const DRF_LADDER = [
  { q: "If credentials were sent, are they valid?", no: "401", hint: "or 403, see caption" },
  { q: "May this user call this endpoint? has_permission()", no: "403", hint: "anonymous: 401 or 403" },
  { q: "Under the throttle rate?", no: "429", hint: "with Retry-After" },
  { q: "Is the object in get_queryset()?", no: "404", hint: "others’ data stays invisible" },
  { q: "May they act on this object? has_object_permission()", no: "403", hint: "detail views only" },
  { q: "Does the input validate? serializer.is_valid()", no: "400", hint: "field-level errors" },
];

export function DjPermissionsFigure({ number }: FigureProps) {
  return (
    <FigureFrame
      id="dj-permissions"
      number={number}
      wide
      title="The checks DRF runs, in order"
      caption={
        <>
          DRF answers an unauthenticated request with <code>401</code> only when the first
          authentication class supplies a <code>WWW-Authenticate</code> header (token, JWT, basic).
          With <code>SessionAuthentication</code> first, the same request gets <code>403</code>.
          Object permissions run only when the view calls <code>get_object()</code>, so list
          endpoints rely entirely on <code>get_queryset()</code>.
        </>
      }
    >
      <div className="pub-ladder" style={{ marginTop: 0 }}>
        <p className="pub-panel-title">Stop at the first “no”</p>
        <ol>
          {DRF_LADDER.map((step) => (
            <li key={step.q}>
              <span className="pub-ladder-q">{step.q}</span>
              <span className="pub-ladder-arrow" aria-hidden>no →</span>
              <span className="pub-ladder-code">{step.no}</span>
              <span className="pub-ladder-hint">{step.hint}</span>
            </li>
          ))}
        </ol>
        <p className="pub-ladder-ok">All “yes”? The handler runs and calls the service.</p>
      </div>
    </FigureFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 6. Releases and migrations                                          */
/* ------------------------------------------------------------------ */

export function DjMigrationsFigure({ number }: FigureProps) {
  return (
    <FigureFrame
      id="dj-migrations"
      number={number}
      wide
      title="Shipping a schema change while old and new code both run"
      caption="During a rolling deploy, old and new versions of the app share one database, so every migration must work with both. Expand first, switch the code, contract last."
    >
      <Steps
        cols={5}
        steps={[
          { title: "Build and test", body: "Image, test suite, check --deploy.", tone: "accent" },
          { title: "Migrate once", body: "A separate release step, not on every container start.", tone: "violet" },
          { title: "Deploy the app", body: "Old and new instances overlap.", tone: "accent" },
          { title: "Watch", body: "Error rate and latency against the last release.", tone: "gold" },
          { title: "Roll back code, not data", body: "Expand-only migrations make this safe.", tone: "positive" },
        ]}
      />
      <ol className="pub-timeline pub-mt" style={{ "--timeline-cols": 3 } as React.CSSProperties}>
        <li className="pub-tone-positive">
          <span className="pub-timeline-dot" />
          <p className="pub-timeline-when">Release 1 · expand</p>
          <p className="pub-timeline-what">Add a nullable column</p>
          <code className="pub-snippet">AddField(null=True)</code>
          <p className="pub-small">Code writes both old and new fields. Backfill existing rows in batches.</p>
        </li>
        <li className="pub-tone-gold">
          <span className="pub-timeline-dot" />
          <p className="pub-timeline-when">Release 2 · switch</p>
          <p className="pub-timeline-what">Read the new column</p>
          <code className="pub-snippet">AlterField(null=False)</code>
          <p className="pub-small">Once every row has a value, add the constraint. Stop writing the old field.</p>
        </li>
        <li className="pub-tone-danger">
          <span className="pub-timeline-dot" />
          <p className="pub-timeline-when">Release 3 · contract</p>
          <p className="pub-timeline-what">Remove the old column</p>
          <code className="pub-snippet">RemoveField</code>
          <p className="pub-small">Only after no running code references it.</p>
        </li>
      </ol>
    </FigureFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 7. Quick reference                                                  */
/* ------------------------------------------------------------------ */

export function DjQuickReferenceFigure({ number }: FigureProps) {
  return (
    <FigureFrame id="dj-quick-reference" number={number} wide title="Django and DRF quick reference">
      <div className="pub-qr">
        <section>
          <h4>manage.py</h4>
          <table>
            <tbody>
              <tr><td><code>startapp</code></td><td>new app</td></tr>
              <tr><td><code>makemigrations</code></td><td>write migrations</td></tr>
              <tr><td><code>migrate</code></td><td>apply them</td></tr>
              <tr><td><code>sqlmigrate app 0004</code></td><td>see the SQL</td></tr>
              <tr><td><code>shell</code> · <code>dbshell</code></td><td>poke around</td></tr>
              <tr><td><code>check --deploy</code></td><td>production checklist</td></tr>
              <tr><td><code>collectstatic</code></td><td>gather static files</td></tr>
            </tbody>
          </table>
        </section>
        <section>
          <h4>Query toolbox</h4>
          <table>
            <tbody>
              <tr><td><code>select_related</code></td><td>FK, one-to-one</td></tr>
              <tr><td><code>prefetch_related</code></td><td>reverse FK, M2M</td></tr>
              <tr><td><code>Q()</code></td><td>OR, NOT</td></tr>
              <tr><td><code>F()</code></td><td>field maths in SQL</td></tr>
              <tr><td><code>annotate()</code></td><td>value per row</td></tr>
              <tr><td><code>aggregate()</code></td><td>one summary dict</td></tr>
              <tr><td><code>only()</code> · <code>values()</code></td><td>load less</td></tr>
              <tr><td><code>exists()</code></td><td>instead of <code>len()</code></td></tr>
            </tbody>
          </table>
        </section>
        <section>
          <h4>Writes and integrity</h4>
          <table>
            <tbody>
              <tr><td><code>transaction.atomic</code></td><td>all or nothing</td></tr>
              <tr><td><code>select_for_update()</code></td><td>lock rows</td></tr>
              <tr><td><code>on_commit()</code></td><td>side effects after commit</td></tr>
              <tr><td><code>update()</code> · <code>bulk_*</code></td><td>skip save() and signals</td></tr>
              <tr><td><code>UniqueConstraint</code></td><td>backs get_or_create</td></tr>
              <tr><td><code>CheckConstraint</code></td><td>rules in the DB</td></tr>
            </tbody>
          </table>
        </section>
        <section>
          <h4>Models</h4>
          <ul>
            <li>Custom user model before the first migration</li>
            <li><code>TextChoices</code> for enumerations</li>
            <li><code>related_name</code> on every FK</li>
            <li>A deliberate <code>on_delete</code></li>
            <li>Money as integer cents or <code>DecimalField</code></li>
          </ul>
        </section>
        <section>
          <h4>DRF</h4>
          <ul>
            <li>Explicit <code>fields</code>, never <code>&quot;__all__&quot;</code></li>
            <li>Scope data in <code>get_queryset()</code></li>
            <li><code>IsAuthenticated</code> as the default</li>
            <li>Annotate counts, no queries in method fields</li>
            <li>Paginate every list</li>
          </ul>
        </section>
        <section>
          <h4>Checks DRF runs</h4>
          <table>
            <tbody>
              <tr><td>authenticate</td><td>401 or 403</td></tr>
              <tr><td><code>has_permission</code></td><td>403</td></tr>
              <tr><td>throttles</td><td>429</td></tr>
              <tr><td><code>get_queryset</code></td><td>404</td></tr>
              <tr><td><code>has_object_permission</code></td><td>403</td></tr>
              <tr><td>serializer</td><td>400</td></tr>
            </tbody>
          </table>
        </section>
        <section>
          <h4>Tests</h4>
          <ul>
            <li>pytest-django + factory_boy</li>
            <li>Anonymous, wrong user, right user</li>
            <li>Assert query counts on lists</li>
            <li>Services tested without HTTP</li>
            <li><code>captureOnCommitCallbacks</code> for on_commit</li>
          </ul>
        </section>
        <section>
          <h4>Production settings</h4>
          <pre>{`DEBUG = False
SECRET_KEY = env(...)
ALLOWED_HOSTS = [...]
CSRF_TRUSTED_ORIGINS = [...]
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = ...`}</pre>
        </section>
        <section>
          <h4>Release</h4>
          <ul className="pub-ticks">
            <li>Tests and <code>check --deploy</code> pass</li>
            <li>Migrations backward compatible</li>
            <li><code>migrate</code> once, as its own step</li>
            <li>Static on WhiteNoise or a CDN</li>
            <li>Media in object storage</li>
            <li>Errors tracked, backups restorable</li>
          </ul>
        </section>
      </div>
    </FigureFrame>
  );
}
