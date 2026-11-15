/**
 * Handcrafted first batch. No LLM API.
 * Voice: first person as Nyuydine Bill Leynyuy. No em/en dashes.
 */
export type LocalArticle = {
  topicId: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  cluster: string;
};

export const localBatch01: LocalArticle[] = [
  {
    topicId: "arch-boundaries",
    cluster: "Software Architecture",
    title: "How I draw service boundaries before writing code",
    excerpt:
      "I split systems by change frequency and ownership, not by how pretty the boxes look on a whiteboard.",
    tags: ["architecture", "system-design"],
    content: `I used to draw service boundaries the way textbooks suggest: nouns on a domain map, arrows between them, then a repo for every box. That produced clean diagrams and messy ownership. Now I start from a quieter question: what will change together, and who will be on the hook when it breaks?

## Change frequency beats noun maps

If two pieces of behavior ship in the same pull requests week after week, they are not independent services. They are one module wearing a network costume. On Deligon, talent matching, scoring inputs, and the ranking explanation UI changed as a unit for months. Splitting them early would have meant three deploy pipelines for one product decision.

I look for seams where the rate of change diverges. Auth and session handling change rarely. Prompt templates and retrieval rules for an AI feature change often. Those belong in different deployable units, even if they share a database today.

## Ownership is a boundary

A boundary without an owner is a shared kitchen. Everyone cooks, nobody cleans. Before I extract a service, I want a named person or small team who can merge without waiting on a committee. If the answer is "whoever is free," I keep it inside the modular monolith and enforce a folder and package boundary instead.

Cameroon Digital Trust Network taught me this the hard way. Cross-cutting identity checks looked like a neat shared library until three teams edited it with different assumptions. The fix was not more microservices. It was clearer ownership of the contract and a slower, reviewed path for changes.

## Heuristics I actually use

1. **Same release train, same module.** If you cannot ship A without B, do not pretend they are separate.
2. **Different failure budgets, different services.** User-facing CRUD can tolerate short blips. Payment or trust verification cannot. Isolate what must stay up.
3. **Data ownership before API ownership.** Whoever writes the source of truth owns the schema. Readers get a stable contract, not a foreign key into someone else's tables.
4. **Prefer modules until pain is real.** Latency, independent scale, or compliance isolation are real pains. "It might grow" is not.

## What I write down before code

For each candidate boundary I keep a short note:

- Purpose in one sentence
- Writes it owns
- Reads it depends on
- Failure mode when it is down
- Who merges

That note is usually a markdown file next to the ADR folder. It is boring on purpose. Future me does not need poetry. Future me needs to know why the box exists.

## When I ignore my own rules

Prototypes get fuzzy boundaries. ResolveMeQ started denser than it is now. That was fine while we were proving the helpdesk loop. The mistake is leaving the prototype shape after traffic arrives. Once you have real callers and real incidents, redraw with the heuristics above and pay the extraction cost once, deliberately.

Service boundaries are product decisions dressed as infrastructure. Draw them for change and ownership, then write the code that fits.`,
  },
  {
    topicId: "arch-rewrite",
    cluster: "Software Architecture",
    title: "When a rewrite is the wrong answer",
    excerpt:
      "Most rewrites start as frustration with the old code. The better move is often a strangler path with sharper seams.",
    tags: ["architecture", "engineering-judgment"],
    content: `Rewrites feel righteous. The old system is slow, the tests are sparse, and everyone has a story about a bug that "would never happen in a clean rewrite." I have said that sentence myself. I have also watched rewrites burn quarters while the product stood still.

## Frustration is not a design input

Ugly code that still earns money is not automatically a candidate for demolition. Ugly code that cannot accept the next required change is. The difference is a concrete blocked capability, not a vibe.

Before I argue for a rewrite I ask:

- Which user journey is blocked today?
- What is the smallest change that unblocks it?
- What would a parallel rewrite need to match on day one for parity?

If nobody can answer the third question, the rewrite will discover requirements the hard way, in production.

## Extend when the domain is still right

Often the domain model is fine and the implementation is tired. On client sites and smaller products, I have replaced rendering layers, swapped ORMs, and introduced queues without throwing away the business vocabulary. That is cheaper than teaching a new codebase the same nouns.

A rewrite is more justified when the domain itself was wrong: you modeled jobs as posts when they were workflows, or you treated AI output as trusted content when it needed review states. Then you are not polishing. You are correcting the map.

## The strangler habit

When something must go, I prefer a strangler path:

1. Put a facade in front of the old behavior.
2. Route one vertical slice to the new implementation.
3. Compare outcomes (latency, error rate, business metrics).
4. Move the next slice only after the first is boring.

JotEcho's publishing pipeline grew this way. New AI steps landed beside older paths until the old ones had no callers. Nobody noticed a big-bang cutover because there was not one.

## Cost people forget

Rewrites hide cost in:

- Feature freeze while parity work continues
- Lost tribal knowledge encoded in edge cases
- Dual-running data migrations
- Team morale when month four still looks like month one

Those costs are real even when the new stack is objectively nicer.

## A decision rule I trust

Rewrite when the current shape cannot express the next two product milestones without constant exceptions. Extend when the milestones fit and the pain is local (a module, a storage choice, a deploy story).

If the team wants a rewrite mainly to use a fashionable framework, I push back. Frameworks do not repay lost time. Clearer seams do.`,
  },
  {
    topicId: "arch-contracts",
    cluster: "Software Architecture",
    title: "API contracts that survive team growth",
    excerpt:
      "Contracts fail quietly when ownership, versioning, and error shapes are left as afterthoughts.",
    tags: ["architecture", "apis"],
    content: `An API contract is a promise about what happens when someone else depends on you. Early in a project that someone else is often future you. Later it is another team, a mobile app, or a partner. The promise has to survive growth without weekly breakages.

## Own the write path

I treat the producer of a resource as the owner of its contract. Consumers can request fields. They do not invent meanings. When two services both "kind of own" a user profile, you get silent drift: one side adds \`full_name\`, the other still sends \`name\`, and clients paper over both.

On Deligon, talent intelligence endpoints are explicit about which service is source of truth for skills versus assessments. That clarity beats a shared grab bag of JSON.

## Version in public, evolve in private

I prefer additive changes first: new optional fields, new endpoints, new query flags. Breaking changes get a version path (\`/v2\`) or a dated media type, plus a sunset date communicated early.

Internal-only endpoints can move faster, but I still document them. "Internal" has a way of becoming "the mobile app also uses it."

## Error shapes matter as much as 200s

Clients retry blindly when errors are vague. I standardize:

- Machine-readable \`code\`
- Human-readable \`message\`
- Optional \`details\` for field errors
- Stable HTTP status classes (4xx vs 5xx)

AI features need this even more. A model timeout is not the same as invalid input. If both return 500 with a string, the UI cannot choose between retry and fix-your-prompt.

## Failure modes to name up front

Every contract note should answer:

- What if the dependency is slow?
- What if partial data is available?
- What if auth is valid but authorization fails?

Partial success is where many APIs lie. Either commit to all-or-nothing or return a structured partial result. Hiding half-writes behind a 200 is how support tickets are born.

## Review the contract like code

I review OpenAPI or type definitions in PRs the same way I review implementation. A renamed field is a product change. A loosened validation is a security change. Treat it that way and team growth stops feeling like chaos.`,
  },
  {
    topicId: "arch-monolith",
    cluster: "Software Architecture",
    title: "A modular monolith is often enough",
    excerpt:
      "Microservices buy isolation. Most early products need modularity and a single deploy story more than isolation.",
    tags: ["architecture", "monolith"],
    content: `Microservices are a scaling tool for organizations and failure domains. They are a poor default for a product that still fits in one team's head. I ship modular monoliths more often than service meshes, and I do not apologize for it.

## What modular means here

A modular monolith is one deployable with hard internal boundaries:

- Packages or folders with explicit public APIs
- No reaching into another module's database tables
- Shared kernel kept small (auth identity, logging, clock)
- Features that can later extract without rewriting the domain

ResolveMeQ lived this pattern while the helpdesk loop was still finding product-market fit. One repo, one pipeline, clear modules for intake, AI suggestions, and human review.

## Costs microservices add early

Each new service adds:

- Network failure modes
- Distributed auth and tracing
- Separate versioning and migrations
- More dashboards and on-call surface

Those costs are worth it when independent scale or team autonomy demands them. They are expensive theater when three engineers are debugging why service A waits on service B's cold start.

## When I do split

I extract when at least one is true:

- A component needs a different runtime or scale profile (GPU workers, heavy batch)
- Compliance requires isolation
- Two teams block each other weekly on the same deploy
- A failure in one area must not take down the whole product

AI inference often meets the first bar. I isolate model calls behind a small service or worker pool while the core API stays modular and boring.

## How I keep a monolith honest

1. Module ownership in CODEOWNERS or an equivalent note
2. Lint or architecture tests against forbidden imports
3. Database schemas namespaced by module even if colocated
4. Feature flags instead of half-extracted services

## The exit ramp

If you design modules cleanly, extraction later is mechanical: move the package, publish the API you already had internally, put a thin HTTP or queue adapter in front. If you design a ball of shared tables, every extraction is a rewrite.

Start with a modular monolith. Earn microservices with real constraints, not fashion.`,
  },
  {
    topicId: "arch-observability",
    cluster: "Software Architecture",
    title: "Observability as a first-class design concern",
    excerpt:
      "If you cannot answer production questions quickly, the architecture is unfinished, no matter how clean the code looks.",
    tags: ["architecture", "observability"],
    content: `I treat observability as part of the design, not a checklist after deploy. A system that cannot explain itself will train the team to guess, and guessing does not scale.

## Design for the questions you will ask

Before I finalize a flow I list the questions on-call will ask:

- Is this request slow because of us or a dependency?
- Which tenant or user cohort is affected?
- Did the AI step fail, or did the downstream write fail?
- Are we degraded or down?

If the architecture cannot produce answers for those questions, I add instrumentation seams: correlation IDs, structured events, and explicit stage timings.

## Logs, metrics, traces: pick jobs

I do not dump everything into logs and hope. Rough split:

- **Metrics** for rates, saturation, and SLOs
- **Traces** for multi-step latency across modules or services
- **Logs/events** for discrete business facts (review approved, publish failed, resume requested)

On Azure and AWS deployments I wire these early so the first production incident is not also the first observability project.

## AI systems need extra honesty

LLM features fail in creative ways: slow streams, empty outputs, policy refusals, partial tool calls. I log stage outcomes with stable codes and sample payloads carefully (redact secrets, truncate aggressively). Without that, "AI is being weird" becomes the entire incident report.

## Sampling beats silence

High-volume paths cannot log every body. I sample success paths and keep errors rich. I also keep a replayable identifier so a support ticket can be tied to a trace without storing PII forever.

## Architecture implication

Sometimes the right design change is a queue boundary solely so you can observe and retry a stage independently. That is not over-engineering. That is making the system operable.

Ship features with the questions already answerable. Pretty boxes without signals are unfinished work.`,
  },
  {
    topicId: "arch-data-models",
    cluster: "Software Architecture",
    title: "Data models that do not box you in later",
    excerpt:
      "PostgreSQL schemas age better when identities, soft boundaries, and naming survive the second product pivot.",
    tags: ["architecture", "databases"],
    content: `Application code can be rewritten in a sprint. A tangled schema haunts you for years. I spend extra time on identities, naming, and soft boundaries before the first migration lands.

## Stable identities

Every important entity gets a durable ID early (UUID or ULID). I avoid natural keys as primary keys when the business might rename them. Email, slug, and external provider IDs are unique constraints, not the soul of the row.

When integrations arrive (Play Store, payroll, OAuth), you will thank yourself for having an internal ID that never changes.

## Name for the domain, not the UI

Columns named \`left_card_text\` die when the UI changes. Columns named \`role_summary\` survive. I ask: if we rebuilt the frontend tomorrow, would this name still make sense?

## Soft boundaries inside one database

Even in a modular monolith I namespace tables (\`billing_\`, \`publishing_\`, \`review_\`) and avoid cross-module foreign keys when a loosely held reference will do. Hard FKs across modules make extraction and independent testing painful.

Shared lookup tables are fine. Shared write ownership is not.

## Nullability and history

I am cautious with \`NOT NULL\` on fields marketing might invent next quarter. I am strict with \`NOT NULL\` on fields the domain cannot function without. I also plan for history: status transitions often need a small events table rather than overwriting a single status column and losing the story.

## Migrations as product changes

A migration that rewrites meaning (not just adds a column) gets the same review energy as an API break. Expand/contract patterns beat heroic overnight locks.

## Practical default

Start normalized enough to avoid update anomalies, denormalize read models deliberately when a page needs them, and document which side is source of truth. That combination has aged better for me than either pure purity or early mega-JSON columns.`,
  },
  {
    topicId: "arch-tradeoffs",
    cluster: "Software Architecture",
    title: "Writing down trade-offs so future you does not guess",
    excerpt:
      "A short decision note beats archaeology in Slack when the next engineer asks why the system looks this way.",
    tags: ["architecture", "documentation"],
    content: `I forget why I made decisions. Teams forget faster. The cure is not a wiki novel. It is a lightweight habit of writing trade-offs while they are still sharp.

## The smallest useful ADR

I keep architecture decision records short:

- Context
- Decision
- Alternatives considered
- Consequences

If it does not fit on one screen, I am probably writing a design doc instead, which is fine, but most day-to-day choices need the short form.

## Capture the rejected path

The valuable part is often what you did not choose. "We rejected per-tenant databases because ops cost outweighed isolation at current scale." Six months later someone will re-propose the rejected path. The note saves a week of re-debate.

## Put notes next to code

I store ADRs in the repo. Docs that live only in Notion drift from reality. A markdown folder that ships with the service stays visible in PRs.

## When I write one

- Choosing sync vs async for a workflow
- Picking a modular monolith vs a new service
- Accepting a vendor constraint
- Deliberately taking on tech debt with a date to revisit

I do not write an ADR for renaming a button.

## Consequences need dates

Open-ended debt is how systems rot. If the consequence is "we'll revisit after we have 10x traffic," I add a calendar reminder or a ticket with a trigger metric. Future me needs a tripwire, not a slogan.

## Culture effect

When trade-offs are written down, code review gets calmer. Disagreement becomes about the note, not about egos in a meeting. That alone is worth the ten minutes.`,
  },
  {
    topicId: "arch-events",
    cluster: "Software Architecture",
    title: "Event-driven pieces without ceremony",
    excerpt:
      "Async helps when stages can fail and retry independently. It hurts when it only hides a synchronous bug behind a queue.",
    tags: ["architecture", "events"],
    content: `Event-driven architecture has a branding problem. People hear Kafka and platforms. I usually mean something smaller: a job queue, a domain event table, or a webhook outbox that makes stages honest about failure.

## When async earns its keep

I reach for events when:

- A step can take longer than a user should wait
- Retries are expected (email, webhooks, model calls)
- Multiple consumers need the same fact
- A failure in step 3 should not unwind step 1 without a plan

JotEcho's publish flow benefits here. Draft generation, asset prep, and channel push do not belong in one blocking request.

## When async is theater

If the producer waits for the consumer to finish anyway, you built a distributed function call with worse debugging. If ordering is strict and volume is low, a transactional state machine in Postgres may be clearer than a broker.

## Minimal shapes I like

1. **Transactional outbox:** write business row + outbox row in one transaction, worker publishes later.
2. **Queue per stage:** explicit retry and visibility timeout.
3. **Domain events inside the monolith:** in-process first, promote to a bus only when a second service appears.

Start at the smallest shape that matches the failure mode.

## Contracts for events

Events need schemas too: versioned payloads, clear identity of the aggregate, and idempotency keys. Consumers will retry. Design for duplicate delivery on day one.

## Visibility

Every event handler should emit a metric for success, retry, and poison. Async systems fail quietly if you only watch HTTP dashboards.

Use events to make time and failure explicit. Skip the ceremony until you have two real consumers or a real retry problem.`,
  },
  {
    topicId: "ai-prod-not-demo",
    cluster: "AI Systems",
    title: "Shipping LLM features that survive real traffic",
    excerpt:
      "Demos optimize for a happy prompt. Production needs budgets, fallbacks, and a path when the model is wrong.",
    tags: ["ai", "llms", "production"],
    content: `A demo LLM feature answers one prompt beautifully. A production LLM feature survives bad inputs, slow vendors, partial outages, and users who paste an entire PDF into a text box. I design for the second world.

## Budgets before prompts

I set explicit budgets:

- Max latency to first token and to completion
- Max cost per request and per tenant per day
- Max input size after truncation rules

When a call would break the budget, I fail early with a clear error instead of streaming garbage for forty seconds.

## Failure modes are product features

I map what the UI does when:

- The provider times out
- The model returns empty or malformed structured output
- Safety filters block content
- Tools/functions fail mid-plan

ResolveMeQ's helpdesk suggestions degrade to retrieval-only or human draft paths rather than blocking the ticket. Users prefer a partial honest answer to a spinner of doom.

## Structured outputs with validation

Free-form prose is fine for chat. For workflows I ask for JSON (or a strict schema) and validate before side effects. If validation fails, retry once with a repair prompt, then fall back. Never write to the database from unparsed model text.

## Human review where stakes are high

Anything that sends external communication, changes money, or makes a trust decision gets a review gate or a strong confirmation. Automation can draft. People approve.

## Observability for models

I track accept/edit/reject rates for suggestions, not just token counts. If users constantly rewrite outputs, the feature is not helping, even if the endpoint is healthy.

## Ship the boring envelope first

Authz, rate limits, idempotency, and audit logs ship with the feature, not after the first incident. The model is the unpredictable middle. The envelope should be dull and solid.

Production AI is systems engineering with a stochastic dependency. Treat it that way and demos become features that last.`,
  },
  {
    topicId: "ai-guardrails",
    cluster: "AI Systems",
    title: "Human-review guardrails for high-stakes AI decisions",
    excerpt:
      "The goal is not to slow every click. It is to keep humans in the loop where mistakes are expensive or irreversible.",
    tags: ["ai", "safety"],
    content: `I like AI features that move quickly on low-stakes work and slow down when the blast radius grows. Guardrails are how you encode that judgment into the product instead of hoping operators are careful.

## Rank by blast radius

I classify actions:

- **Low:** rewrite a draft paragraph, suggest tags
- **Medium:** change internal status, enqueue a job
- **High:** email a customer, publish publicly, alter access, make a trust claim

Low can be mostly automatic with undo. High needs a human checkpoint or a dual-control pattern.

## Make review a first-class state

Do not bolt approval on as a boolean afterthought. Model it:

- \`draft\` → \`pending_review\` → \`approved\` / \`rejected\`
- reviewer identity and timestamp
- reason codes on rejection

That history matters for audits and for improving the model later.

## Show the evidence, not just the answer

Reviewers need the why: source snippets, confidence notes, policy hits, diff against the previous version. A naked "AI says yes" button trains people to rubber-stamp.

## Escape hatches

Every guarded flow needs:

- Skip/override with logged justification (for emergencies)
- Expire stale pending items so queues do not rot
- Escalate when the model self-reports low confidence or validators fail

## Culture and UX

If review is painful, people bypass it. Keep the queue fast, keyboard friendly, and focused on one decision at a time. The best guardrail is the one reviewers actually use.

High-stakes AI without human review is not speed. It is deferred incident response. Put people where the mistakes hurt, and let automation run where undo is cheap.`,
  },
];
