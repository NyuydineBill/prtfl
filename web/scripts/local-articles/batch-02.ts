import type { LocalArticle } from "./batch-01";

export const localBatch02: LocalArticle[] = [
  {
    topicId: "ai-prompts",
    cluster: "AI Systems",
    title: "Prompt design as engineering, not vibes",
    excerpt:
      "I treat prompts like code: versioned, tested against fixtures, and guarded against quiet regressions.",
    tags: ["ai", "prompt-engineering"],
    content: `Prompt work gets romanticized as taste. Taste matters, but production prompts behave like software. They break when inputs change, they drift when models update, and they fail silently when nobody asserts the output shape.

## Start from the contract

Before I write clever instructions I define what success looks like:

- Required fields or sections
- Forbidden behaviors (invented citations, leaking system text)
- Tone constraints that are testable ("no em dashes", "first person", "no marketing openers")
- Hard size limits

If I cannot write those as checks, I do not yet understand the feature.

## Fixtures beat one-off playground wins

I keep a small fixture set: good inputs, adversarial inputs, empty inputs, oversized pastes, and multilingual samples when relevant. Each fixture has an expected outcome class: pass, soft fail (repairable), hard fail (escalate or fallback).

When I change a prompt, I run the fixtures. A prettier answer on one happy path is not a release.

## Version prompts in the repo

Prompts live in version control next to the code that calls them. "Whatever is in the admin textarea" is how you lose the thread after an incident. If operators need to tune live, I still snapshot versions and record which version served each request.

## Separate policy from task

I split system policy (safety, voice, formatting) from task instructions (summarize this ticket, extract skills). Policy changes less often. Task prompts change with product experiments. Mixing them makes every experiment a policy risk.

## Regression habits

After a model upgrade I re-run fixtures before flipping traffic. I also sample production accepts and edits. If users constantly rewrite a field, the prompt is lying about quality even when automated checks pass.

Prompt design is engineering when you can explain what changed, why, and how you know it still works.`,
  },
  {
    topicId: "ai-isolation",
    cluster: "AI Systems",
    title: "Why I isolate AI services from the core API",
    excerpt:
      "Model calls have different scale, failure, and deploy rhythms than CRUD. I keep those domains apart on purpose.",
    tags: ["ai", "architecture"],
    content: `Core APIs want predictability. AI workers want burst capacity, longer timeouts, and frequent prompt deploys. Forcing both into one process creates awkward compromises: either the API waits too long, or the AI path inherits release fear that belongs to billing and auth.

## Different failure domains

If the model provider blips, the product should still list tickets, show drafts, and accept human work. Isolating AI behind a queue or a dedicated service lets the core API return "suggestion pending" instead of 503 on the whole app.

ResolveMeQ leans on this idea: helpdesk operators keep moving while suggestion generation retries in the background.

## Different deploy cadence

Prompt and tool changes ship often. Schema and auth changes should not. A separate AI service (or at least a separate worker pool) lets me roll model config without redeploying every horizontal concern.

## Scale and cost knobs

AI load is spiky and expensive. Isolation makes it easier to:

- Cap concurrency per tenant
- Route cheap vs strong models
- Autoscale workers without resizing the entire API fleet

## How thin the boundary can be

Isolation does not require a microservice mesh on day one. A dedicated worker consuming jobs from Postgres or Redis is enough. The important part is the contract: the core writes an intent, the AI side writes a result, neither blocks the other's request thread.

## Shared rules that still apply

Authz decisions stay in the core. The AI service receives already-authorized work units. That prevents a clever prompt path from becoming an authorization bypass.

Keep AI adjacent, not entangled. Your users feel reliability. Your future self feels the deploy freedom.`,
  },
  {
    topicId: "ai-eval",
    cluster: "AI Systems",
    title: "Evaluating AI output without lying to yourself",
    excerpt:
      "Offline scores, spot reviews, and production sampling beat a single demo that makes everyone clap.",
    tags: ["ai", "evaluation"],
    content: `Evaluation is where AI projects quietly cheat. A founder likes one answer, a spreadsheet gets a green cell, and the team ships. I prefer evaluations that can embarrass me before users do.

## Three layers

1. **Offline fixtures** with expected structural properties
2. **Spot reviews** by a human who knows the domain
3. **Production sampling** of real traffic with accept/edit/reject signals

Skipping any layer creates a blind spot. Offline alone misses distribution shift. Reviews alone do not scale. Production alone discovers pain after it is live.

## Score what the product needs

Generic "helpfulness" rubrics are mushy. I score product-specific outcomes: Did the suggestion include a reproducible next step? Did the draft stay inside the brand rules? Did the extracted skills match the evidence span?

If the metric does not map to a user action, it will not guide engineering.

## Do not average away failure modes

A 4.2 average can hide a 5% catastrophic miss. I track rates of serious errors separately: fabricated facts, policy violations, empty structured payloads.

## Sampling without drowning

I sample by risk: higher rates on high-stakes actions, lower on low-stakes rewrites. Reviewer time is budgeted like compute.

## Honesty practices

- Blind reviews when comparing prompt versions
- Freeze the rubric before looking at outputs
- Record disagreement between reviewers

Eval is not a ceremony to justify a launch. It is a continuous instrument. If it never changes your mind, it is theater.`,
  },
  {
    topicId: "ai-rag",
    cluster: "AI Systems",
    title: "Retrieval that stays useful after the demo day",
    excerpt:
      "Chunking, freshness, and grounding failures show up after the first impressive answer wears off.",
    tags: ["ai", "rag"],
    content: `Demo RAG is a folder of PDFs and a smiling answer. Production RAG is a freshness problem, a permissions problem, and a trust problem wearing an embedding model.

## Chunk for the question shape

Chunk size is not a universal constant. FAQ blurbs want small chunks. Architecture docs want larger sections with headings preserved. I keep metadata: source, updated_at, access scope, and section title. Retrieval without metadata is how you cite a deprecated page confidently.

## Freshness beats clever embeddings

An index that is wrong is worse than no retrieval. I schedule re-ingest for changing corpora and tombstone deleted docs. When content is tenant-specific, isolation is mandatory. One customer's policy must never appear in another's context window.

## Grounding failures I watch

- Answer cites sources that do not support the claim
- Top-k returns near-duplicates that waste tokens
- Query is conversational fluff that retrieves noise
- The system answers when retrieval confidence is empty

I prefer "I do not have that in the knowledge base" over improvisation for support and trust use cases.

## Hybrid search when keywords matter

Names, error codes, and IDs often need lexical match. Hybrid retrieval (keyword + vector) has saved me more than prompt pep talks.

## Measure groundedness

Track citation click-through, reviewer flags for unsupported claims, and fallback rates when retrieval returns nothing useful. Those metrics keep RAG honest after launch day applause fades.`,
  },
  {
    topicId: "ai-cost",
    cluster: "AI Systems",
    title: "Controlling LLM cost without starving quality",
    excerpt:
      "Caching, model routing, and per-tenant budgets keep AI features alive when usage spikes.",
    tags: ["ai", "cost"],
    content: `LLM cost surprises teams that priced the happy path. Real traffic includes retries, long pastes, and power users. I budget like an engineer, not like a slide deck.

## Route by job difficulty

Not every request needs the strongest model. Classification, short rewrite, and extraction often run on a smaller model. Hard reasoning and high-stakes drafting use a stronger one. Routing rules live in config and are measurable.

## Cache what is stable

Identical system prompts plus identical normalized inputs can reuse results for a TTL. Partial caching helps too: retrieved chunks, embeddings, and tool results. Do not cache personalized high-stakes decisions without a clear keying story.

## Budgets in product, not only in finance

Per-tenant daily caps, soft warnings, and hard stops prevent one customer from eating the margin. The UI should say what happened. Silent quality degradation trains distrust.

## Shrink context deliberately

Prompt bloat is a cost bug. I trim history, summarize older turns, and cap retrieved chunks. Paying for tokens that do not change the answer is waste.

## Watch unit economics

I track cost per successful user outcome, not only cost per 1k tokens. A cheaper model that users reject is not cheaper.

Cost control is part of product quality. If the feature is good but unaffordable, it will be turned off. Design the envelope so quality and spend can coexist.`,
  },
  {
    topicId: "ai-voice",
    cluster: "AI Systems",
    title: "Keeping brand voice consistent across AI drafts",
    excerpt:
      "Multi-platform casting taught me that voice rules must be enforceable, not just described in a style guide PDF.",
    tags: ["ai", "product"],
    content: `Brand voice dies in AI drafts when the only guidance is "be professional and friendly." That instruction fits a thousand brands. Consistent voice needs constraints a model can follow and a reviewer can check.

## Encode voice as rules

I translate style guides into concrete prohibitions and preferences: sentence length bands, banned phrases, punctuation rules, point of view, and how claims are hedged. JotEcho-style casting across channels makes this obvious. LinkedIn, a newsletter, and a short social post share a voice but not a length or CTA shape.

## One source, many casts

Generate a canonical draft, then cast to channel templates. Casting is a second prompt with tighter limits, not a fresh invention each time. That preserves the core message while fitting the medium.

## Examples over adjectives

Few-shot samples of on-voice and off-voice writing beat more adjectives. I keep a small gold set and rotate it so the model does not overfit one paragraph.

## Human polish where it counts

Public posts from a founder still deserve a human pass. AI accelerates. It does not replace judgment about timing, taste, and risk.

## Regression on voice

When prompts change, I score fixtures for voice violations the same way I score structural errors. Voice is a product requirement, not a nice-to-have.

Consistency is a system: rules, casts, examples, and review. Vibes alone will not survive the third platform.`,
  },
  {
    topicId: "ai-chatbot",
    cluster: "AI Systems",
    title: "Grounded chatbots beat clever chatbots",
    excerpt:
      "Personality without knowledge boundaries creates confident wrong answers. I optimize for grounded scope first.",
    tags: ["ai", "chatbots"],
    content: `Clever chatbots win demos. Grounded chatbots win support queues. The difference is whether the bot knows when it does not know.

## Draw the knowledge fence

I define what the bot may talk about: product docs, account workflows, public FAQs. Outside that fence it should refuse or hand off. Personality is allowed inside the fence. Outside, charm becomes liability.

## Retrieval before improvisation

For product questions I retrieve first. If retrieval is empty, the bot says so and offers a human path. Inventing a refund policy is worse than a short apology.

## Conversation state is product state

I keep structured state (intent, account context, escalation flag) separate from chat fluff. That lets the UI show progress and lets operators resume without reading a novel of embeddings.

## Evaluation that matches reality

Transcript reviews beat single-turn prompt playgrounds. Multi-turn confusion, repeated questions, and angry users are the real dataset.

## Handoff is a feature

A good bot knows the moment to stop. Capture context, summarize for the human, and transfer. That is not failure. That is design.

Build the fence, then the voice. Cleverness without grounding is just a faster way to lose trust.`,
  },
  {
    topicId: "ai-hiring",
    cluster: "AI Systems",
    title: "Skills verification beats keyword matching in hiring AI",
    excerpt:
      "Talent intelligence work on Deligon reinforced that keywords are cheap signals. Verified skills are the product.",
    tags: ["ai", "recruitment"],
    content: `Keyword matching feels like AI because it is automated. It still inherits the worst of resume spam: people mirror the job description, and the system rewards the mirror.

## Evidence over echo

I prefer pipelines that extract claimed skills, then seek evidence: project descriptions, assessments, work samples, structured experiences. A skill without evidence stays a claim. Deligon's skills-first direction exists because hiring teams drown in keyword theater.

## Separate ranking from explanation

A score nobody can explain will not survive a recruiting conversation. I keep features interpretable enough that a recruiter can say why a candidate surfaced. Black-box vibes erode trust inside the hiring team, not only with candidates.

## Bias and proxy risks

Automated systems amplify proxies. I watch for features that stand in for privilege rather than ability, and I keep humans on shortlists that matter. AI can narrow. People should still decide.

## Freshness of skill graphs

Skills rot. A verification from three years ago needs decay or revalidation. The data model should allow confidence over time, not a forever badge.

## Product lesson

Hiring AI that only accelerates keyword filters accelerates noise. Build for verification loops, transparent ranking factors, and human judgment at the decision edge.`,
  },
  {
    topicId: "fs-vertical",
    cluster: "Full-Stack Development",
    title: "Owning a vertical slice end to end",
    excerpt:
      "I deliver faster when one slice includes API, data, UI, and deploy, instead of throwing tickets over walls.",
    tags: ["full-stack", "delivery"],
    content: `Horizontal teams optimize queues. Vertical slices optimize finished user value. I prefer owning a thin path through the stack until it works in production.

## What a slice includes

- Schema or data access for the feature
- API or server actions with authz
- UI states: loading, empty, error, success
- Telemetry for the critical path
- Deploy notes or flags

If any of those are "someone else's turn," the slice is not owned. It is queued.

## Why it reduces thrash

Hand-offs invent mismatch: the API returns a shape the UI did not expect, the migration lands without a rollback story, the empty state was never designed. One owner feels those gaps immediately.

## Boundaries still matter

Owning a slice is not an excuse for spaghetti. I keep module boundaries and ask for review from specialists when the risk is high (payments, crypto-style auth, subtle CSS). Ownership means accountability, not isolation from feedback.

## Slicing technique

I cut by user journey, not by technical layer. "Request a résumé PDF" is a slice. "Build all endpoints" is a layer. Journeys ship. Layers accumulate.

## Mentoring angle

Junior engineers grow faster on vertical slices because they see consequences. Senior engineers keep the architecture honest by refusing slices that secretly require rewriting half the platform.

Ship thin, complete paths. Then widen.`,
  },
  {
    topicId: "fs-django-next",
    cluster: "Full-Stack Development",
    title: "Django + Next.js without fighting yourself",
    excerpt:
      "Put business rules in Django, rendering and interactive UX in Next, and be explicit about cookies and trust boundaries.",
    tags: ["django", "nextjs"],
    content: `Django and Next.js work well together when you stop asking both to be the system of record. Fighting starts when session logic, permissions, and domain rules are duplicated on each side.

## Home for business logic

I keep domain rules, permissions, and durable writes in Django (or the API layer). Next.js handles routing, rendering, caching, and rich UI. When Next starts re-implementing pricing rules, drift is weeks away.

## Auth and cookies

Decide one browser auth story. If Django owns sessions, Next must respect the same cookie domain, secure flags, and CSRF strategy for mutating calls. If you use token headers for SPAs, do not also pretend cookie sessions are optional lore.

I document:

- Where login happens
- What cookie names exist
- Which routes are server-trusted vs public

## Data fetching patterns

Server components and route handlers should call the API with clear service credentials or forwarded user auth. Avoid "anonymous Next server talks to open Django endpoint" unless the data is truly public.

## Avoid dual admin worlds

Pick one admin for operators when possible. Two half-admins guarantee conflicting truths.

## Practical coexistence

- OpenAPI or shared type generation where it pays off
- Explicit error envelopes
- One deployment story for env vars that both sides need

Use each tool for its strength. The fight ends when ownership is obvious.`,
  },
];
