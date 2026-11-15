import type { LocalArticle } from "./batch-01";

export const localBatch04: LocalArticle[] = [
  {
    topicId: "ops-docker",
    cluster: "DevOps & Reliability",
    title: "Docker habits that keep environments honest",
    excerpt:
      "Parity, secrets, and boring reproducibility beat a Dockerfile that only works on one laptop.",
    tags: ["docker", "devops"],
    content: `Docker fails teams when the container is a mystery box that only the author can run. I aim for images that behave the same on a laptop, CI, and a small VPS.

## One path to run the app

\`docker compose up\` (or a thin Makefile wrapper) should bring dependencies and the app up without a tribal README chapter. If onboarding needs twelve manual steps after compose, the container is incomplete.

## Secrets stay out of layers

Build args for non-secret config are fine. API keys in \`Dockerfile\` lines are not. Mount env files or inject runtime secrets. Scan history before you publish an image that once contained a key.

## Pin what matters

Floating \`latest\` tags create heisenbugs. Pin base images and language versions. Rebuild deliberately when you want updates.

## Local parity without cloning production

You do not need every cloud service locally. You do need the same migration path, the same env var names, and a stand-in for queues or object storage when the feature depends on them.

## Slim and explicit

Multi-stage builds, non-root users, and a clear healthcheck make ops calmer. Clever shell in entrypoints should be readable at 2am.

Honest containers reduce "works on my machine" to a joke you no longer need.`,
  },
  {
    topicId: "ops-azure-aws",
    cluster: "DevOps & Reliability",
    title: "Working across Azure and AWS without losing the plot",
    excerpt:
      "Multi-cloud is fine when boundaries are deliberate. It is expensive when every feature spans both by accident.",
    tags: ["azure", "aws", "cloud"],
    content: `I work across Azure and AWS because products and clients already do. The trap is designing every system as if it must be portable theater.

## Pick a home per workload

A product should have a primary cloud for compute and data. Use the other cloud for a specific reason: a client requirement, a managed service gap, or an existing account. Accidental split-brain networking is not a strategy.

## Abstract at the product edge

Application code talks to interfaces: object storage, queue, email, secrets. Adapters speak Azure or AWS. Do not sprinkle SDKs for both providers through domain logic.

## Identity and networking first

Cross-cloud pain is usually IAM and connectivity, not the logo on the VM. Document trust boundaries early. Prefer fewer, clearer connections over a mesh of exceptions.

## Cost and skills

Two clouds mean two billing stories and two incident playbooks. Small teams should minimize that surface unless revenue demands it.

Multi-cloud can be pragmatic. Make the seams intentional or you will debug them forever.`,
  },
  {
    topicId: "ops-logs",
    cluster: "DevOps & Reliability",
    title: "Logs you can actually debug from",
    excerpt:
      "Correlation IDs, structured fields, and less noise turn on-call from archaeology into navigation.",
    tags: ["observability", "logging"],
    content: `Logs that cannot answer "what happened to this request" are decoration. I design logging for navigation under stress.

## Correlate everything

Propagate a request or job ID across API, workers, and AI stages. Without it, you grep hope.

## Structure over prose

JSON fields beat free-text essays. \`event\`, \`user_id\` (when safe), \`duration_ms\`, \`error_code\` query cleanly. Prose belongs in \`message\`, not as the only format.

## Cut the noise

Health checks and routine 200s at debug level. Reserve info for meaningful state changes. Error logs should be rare enough that you read them.

## Redaction

Tokens, passwords, and raw PII do not belong in log drains. Truncate bodies. Sample when volume explodes.

## On-call test

Before calling logging "done," pick a recent bug and time how long it takes to find the path in the logs. If it takes a coffee, keep improving.

Good logs shorten outages. That is their only job.`,
  },
  {
    topicId: "ops-incidents",
    cluster: "DevOps & Reliability",
    title: "Incident notes that make the next outage shorter",
    excerpt:
      "Capture timeline, impact, and decisions while the system is hot. Memory fades faster than you think.",
    tags: ["reliability", "incidents"],
    content: `After an incident, the urge is to move on. I write notes while details are still sharp, because the next outage will rhyme with this one.

## What to capture live

- Detection time and how you noticed
- Impact (who, what features, how bad)
- Hypotheses tried and discarded
- Mitigations applied and when
- Current status while still unstable

A running timeline in Slack or a doc beats heroic memory.

## Separate blameless facts from follow-ups

Facts belong in the record. Action items belong in tickets with owners. Mixing rant and remediation makes neither useful.

## Templates stay short

Long forms do not get filled. A one-page structure that always includes customer impact and a trigger for the next drill works better than a novel.

## Close the loop

Schedule the fix review. An incident without a follow-up is a story, not an improvement.

Notes are how a team compounds hard-won experience.`,
  },
  {
    topicId: "ops-secrets",
    cluster: "DevOps & Reliability",
    title: "Secrets management for solo and small teams",
    excerpt:
      "Env files locally, a real secret store in hosted environments, and rotation habits that do not require a ceremony committee.",
    tags: ["security", "devops"],
    content: `Solo and small teams skip secret hygiene until a key leaks in a screenshot. I keep the process light enough to actually follow.

## Local: ignored env files

\`.env.local\` stays out of git. Provide \`.env.example\` with empty placeholders. Never commit "just for a minute."

## Hosted: platform secrets

Vercel, Azure Key Vault, AWS SSM/Secrets Manager, Supabase secrets: use them. Bake fewer secrets into images and chat threads.

## Rotation without drama

Know how to rotate the database password, the service role key, and the email provider token. Practice once before you need it. Document the blast radius of each secret.

## Least privilege

Service role keys are not frontend keys. Publishable keys are not admin. Split credentials by purpose even when it feels slower at first.

## Leak response

Revoke first, then investigate. Assume anything pastedin a ticket or log is burned.

Small-team security is mostly discipline. Perfect vaults lose to habits you keep.`,
  },
  {
    topicId: "ops-perf",
    cluster: "DevOps & Reliability",
    title: "Performance work before premature optimization",
    excerpt:
      "Measure LCP and API latency against user-visible pain, then fix the hot path instead of polishing the cold one.",
    tags: ["performance", "web"],
    content: `Premature optimization wastes weeks. Blind neglect wastes users. I measure first, then cut the fat that shows up in the numbers that matter.

## Pick user-visible metrics

For web: LCP, INP, CLS on key pages. For APIs: p95 latency and error rate on the authenticated hot paths. Vanity microbenchmarks can wait.

## Find the real culprit

Often it is an image, a blocking font, an N+1 query, or a waterfall of client fetches. Profiling beats guessing which library to rewrite.

## Budget for AI paths

LLM features need separate latency budgets and loading UX. Treating them like CRUD endpoints guarantees frustration.

## Ignore the long tail (at first)

A rare admin report that takes four seconds can wait while the landing page and the main dashboard are slow. Sequence matters.

Measure, fix the bottleneck users feel, then stop until the next measurement says otherwise.`,
  },
  {
    topicId: "mentor-systems",
    cluster: "Mentoring & Career",
    title: "Systems thinking for early-career engineers",
    excerpt:
      "I teach people to ask what breaks upstream and downstream of their ticket, not only how to make the test green.",
    tags: ["mentoring", "career"],
    content: `Early-career engineers are rewarded for closing tickets. Systems thinking is how they graduate from that treadmill into judgment.

## Questions I push

- Who calls this, and what do they assume?
- What happens when this dependency is slow?
- Which data is source of truth?
- How will we know this failed in production?

If they cannot answer, the change is not ready, even if the unit test is.

## Draw the path

I ask mentees to sketch the request from UI to database and back. The sketch reveals magical thinking fast.

## Connect to product

A bug is not only a stack trace. It is a user stuck mid-task. Linking technical effect to human effect builds better instincts than another framework tutorial.

## Patience with the messy middle

Systems thinking feels slow at first. It prevents the thrash of shipping something that cannot be operated.

Teach the questions until they become muscle memory. Code skill will follow.`,
  },
  {
    topicId: "mentor-portfolio",
    cluster: "Mentoring & Career",
    title: "Portfolio projects that prove judgment",
    excerpt:
      "Hiring managers learn more from your trade-offs and failure modes than from another clone of a tutorial app.",
    tags: ["career", "portfolio"],
    content: `Portfolios fail when they only prove you can follow a tutorial. They succeed when they prove you make decisions.

## Show the problem and constraints

What user pain existed? What time or tech constraints shaped the solution? Constraint stories signal seniority more than a long tech stack list.

## Document trade-offs

Why modular monolith instead of microservices? Why this auth pattern? Why you postponed a feature? Judgment lives in the rejected alternatives.

## Prefer real stakes

Client work, community tools, and products with actual users beat another weather app. My own portfolio leans on shipped systems and case studies with architecture notes.

## Make it readable

Clear writing, working links, and honest scope beat animated gimmicks. If a manager skims for two minutes, they should learn what you own.

Build case studies that teach how you think. That is the portfolio.`,
  },
  {
    topicId: "mentor-debug",
    cluster: "Mentoring & Career",
    title: "Teaching debugging as a disciplined habit",
    excerpt:
      "Reproduce, isolate, explain, then fix. Guessing patches teaches the wrong lesson.",
    tags: ["mentoring", "debugging"],
    content: `Debugging is a craft. I refuse to let mentees shotgun-change code until the symptom disappears without understanding.

## The loop

1. **Reproduce** reliably, ideally with a minimal case
2. **Isolate** by bisecting layers (UI, API, data, infra)
3. **Explain** the failure in one clear sentence
4. **Fix** the cause, then add a regression check when it pays off

Skipping explain is how the same bug returns in a costume.

## Tools are secondary

Breakpoints, logs, and bisect help. The habit is forming a hypothesis and killing it with evidence.

## Emotional regulation

Frustration pushes random edits. I coach a pause: write what you know, what you assume, what you will test next.

## Pairing pattern

I narrate my own debugging out loud when pairing. The value is the decision process, not the keystrokes.

Disciplined debugging compounds for an entire career.`,
  },
  {
    topicId: "mentor-feedback",
    cluster: "Mentoring & Career",
    title: "Code review comments that make people better",
    excerpt:
      "Specific, kind, and actionable notes raise the codebase without turning review into a status fight.",
    tags: ["mentoring", "code-review"],
    content: `Code review is mentoring at scale. Vague comments create fear. Pedantic nits create noise. I aim for notes people can use.

## Be specific

"This is unclear" helps nobody. "Rename to \`invoiceId\` so it is not confused with \`externalReference\`" teaches.

## Separate blocking from optional

Prefix suggestions. Reserve hard blocks for correctness, security, and irreversible product risk. Style preferences should not stall merges forever.

## Explain the why

A rule without rationale feels arbitrary. One sentence of why builds shared taste.

## Praise deliberate good moves

Call out solid edge-case handling. Reinforcement teaches as much as critique.

## Tone

Assume competence. Ask questions when you might be missing context. Kindness is not soft standards. It is how standards spread.

Review to grow the author and protect the users. Both matter.`,
  },
];
