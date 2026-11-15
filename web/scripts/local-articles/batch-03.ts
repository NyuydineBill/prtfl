import type { LocalArticle } from "./batch-01";

export const localBatch03: LocalArticle[] = [
  {
    topicId: "fs-auth",
    cluster: "Full-Stack Development",
    title: "Auth patterns I reuse across products",
    excerpt:
      "Sessions for first-party apps, careful JWT use for APIs, and OAuth only where identity should be delegated.",
    tags: ["auth", "security"],
    content: `Auth is where products invent unnecessary originality. I reuse a small set of patterns and spend creativity on the product instead.

## First-party web: server sessions

For browser apps I control, HTTP-only secure cookies with server sessions remain my default. They fit form posts, server rendering, and logout that actually means logout. XSS still matters, but token theft from localStorage is a self-own I avoid.

## APIs and mobile: explicit tokens

Mobile clients and third-party API consumers get short-lived access tokens plus refresh rotation. I keep scopes narrow and revoke on password reset or admin lockout.

## OAuth for delegation, not fashion

Sign in with Google or GitHub is great when users already trust those providers. It is not a substitute for understanding your own session lifecycle. Map provider identity to an internal user ID immediately and never treat the provider subject as your only primary key forever without a plan.

## Threat boundaries I draw early

- CSRF protection on cookie-authenticated mutations
- Rate limits on login and reset
- Separate admin auth elevation where risk is higher
- Audit logs for permission changes

## Shared mental model

Every app answers the same questions: who is the user, what can they do, how long until re-auth, how do we revoke. If those answers live in one module, new features stay safer.

Reuse boring auth. Invent on the product surface.`,
  },
  {
    topicId: "fs-payments",
    cluster: "Full-Stack Development",
    title: "Local and international payments in one product",
    excerpt:
      "Subscriptions, webhooks, and failure recovery matter more than which logo sits on the checkout button.",
    tags: ["payments", "saas"],
    content: `Payments look like a checkout UI. They are really a distributed state machine that fails in public.

## Model the subscription lifecycle

I keep explicit states: trial, active, past_due, canceled, expired. UI and feature gates read those states, not a pile of boolean flags. When local and international processors coexist, normalize into your own status vocabulary.

## Webhooks are source of truth updates

Never trust the browser redirect alone. Confirm through signed webhooks, verify signatures, and make handlers idempotent. Retries will happen. Duplicate events must not double-extend entitlements.

## Failure recovery

Cards fail. Networks flake. Users close the tab. I design:

- Resume checkout links
- Grace periods for past_due with clear messaging
- Manual reconcile tools for support

## Multi-provider reality

In markets where card rails and mobile money both matter, abstract provider details behind an internal PaymentIntent-like record. The product speaks one language. Adapters speak many.

## Security basics

Minimize PCI scope. Do not store raw card data. Log references, not secrets.

Ship payments as durable state plus honest recovery, not as a single happy-path form.`,
  },
  {
    topicId: "fs-forms",
    cluster: "Full-Stack Development",
    title: "Forms that do not become a second product",
    excerpt:
      "Validation, spam traps, and email handoff can stay simple if you refuse feature creep at the boundary.",
    tags: ["full-stack", "ux"],
    content: `Forms attract complexity the way sugar attracts ants. Contact forms become CRMs. Application forms become workflows. I keep the first version boring on purpose.

## Validate once, clearly

Client validation is courtesy. Server validation is law. Mirror the rules and return field-level errors the UI can place without guessing.

## Spam without a captcha arms race

Honeypot fields, timing checks, and rate limits catch a lot. Escalation to stronger challenges only when abuse appears. Accessibility matters more than winning against every bot on day one.

## Handoff to email or queue

For résumé requests and contact flows I write a durable record, then notify. If SMTP fails, the request still exists for retry. The form is not done when the browser shows success. It is done when the operator can act.

## Progressive complexity

Need file uploads later? Add them when a real requester needs them. Need multi-page wizards? Earn them with drop-off data.

A form's job is to capture intent cleanly. Everything else is a different product.`,
  },
  {
    topicId: "fs-mobile",
    cluster: "Full-Stack Development",
    title: "Shipping React Native beside a web product",
    excerpt:
      "Share the API and domain language. Do not force one UI codebase to pretend it is every platform.",
    tags: ["react-native", "mobile"],
    content: `Web and React Native can share a brain without sharing every pixel. The teams that struggle try to unify the wrong layer.

## Share contracts, not screens

I share API types, auth semantics, and domain names. Navigation patterns and interaction details stay native-ish. A forced identical UI usually feels wrong on both platforms.

## Release trains differ

Web deploys are instant. Stores are not. Feature flags and server-driven config keep mobile from waiting on review for every copy change. Plan for staggered versions in the wild.

## Media and performance

Images, lists, and offline expectations differ. Profile on real devices early. A desktop Chrome win means little for a mid-range Android phone.

## One backend, many clients

Auth token refresh, pagination, and error envelopes should be stable. Mobile amplifies chatty APIs. Design endpoints for the constrained client, then let web use the same.

Ship mobile as a product surface with its own constraints, backed by the same source of truth.`,
  },
  {
    topicId: "fs-admin",
    cluster: "Full-Stack Development",
    title: "Admin tools are product surface, not leftovers",
    excerpt:
      "Moderation, publishing, and operator workflows deserve UX care because they decide whether production stays calm.",
    tags: ["full-stack", "admin"],
    content: `Admin UIs get built like closets: shove tools in until the door barely closes. Then operators invent spreadsheets. I treat admin as a product for a small, high-leverage audience.

## Design for the job to be done

Publishing, reviewing AI drafts, refunding, banning abuse. Each job needs a clear queue, filters, and safe actions. A generic table of every row is not a workflow.

## Make dangerous actions obvious

Destroy, publish-all, grant-admin. Those need confirmation, reasons, and audit trails. Speed is good. Silent irreversible clicks are not.

## Same authz model as the API

If the admin UI can do it, the permission must exist server-side. Never trust a hidden button as security.

## Feedback loops

Show what happened after an action: scheduled time, email sent, model version used. Operators should not refresh five pages to confirm reality.

A good admin tool reduces Slack pings and production fear. That is product value.`,
  },
  {
    topicId: "fs-seo",
    cluster: "Full-Stack Development",
    title: "SEO work that is actually engineering",
    excerpt:
      "Metadata, sitemaps, structured data, and content architecture are systems. Keyword stuffing is not a strategy.",
    tags: ["seo", "nextjs"],
    content: `SEO is often handed to writers while the engineering substrate is broken. I reverse that: make the platform deserve good content.

## Technical baseline

- Clean canonical URLs
- Accurate title and description per page
- Open Graph and Twitter cards that match reality
- XML sitemap that only lists live URLs
- robots rules that do not accidentally hide the good stuff
- Structured data for articles and profile where it helps

## Content architecture

Clusters of useful articles beat isolated keyword pages. Internal links should reflect teaching relationships, not a spam net. Scheduling posts so quality stays high is part of SEO engineering too.

## Performance and CLS

Slow LCP and jumping layouts tax rankings and humans together. Image policy, font loading, and server rendering choices are SEO work.

## Measure like an engineer

Search Console coverage, indexed vs submitted, and landing pages that convert matter more than vanity ranks for random terms.

Build the machine that makes publishing trustworthy. Then write things worth indexing.`,
  },
  {
    topicId: "fs-images",
    cluster: "Full-Stack Development",
    title: "Image pipelines that do not crop the point",
    excerpt:
      "object-cover is a composition choice. For articles and portfolios I plan crops, lightbox, and storage deliberately.",
    tags: ["frontend", "images"],
    content: `Images fail product goals when engineering defaults override intent. \`object-cover\` on a 21:9 hero can slice away the subject that made the image worth uploading.

## Decide the job of each image

- Atmosphere background: cover is fine
- Diagram or subject of the article: contain, or provide a lightbox
- Logo marks: never crush aspect ratio

## Pipeline basics

Store originals, derive display sizes, set cache headers, and keep alt text as content, not an afterthought. SVG covers work well for editorial articles when photography is not required.

## Click to expand

If the list view must crop, the detail view should offer the full frame. Users forgive a card crop when the full image is one click away.

## Performance

Serve modern formats when possible, size correctly for the slot, and avoid shipping a 4000px asset into a 400px column.

Treat image policy as UX. The CSS keyword is the last decision, not the first.`,
  },
  {
    topicId: "fs-errors",
    cluster: "Full-Stack Development",
    title: "Error states users can recover from",
    excerpt:
      "Honest messages, retry paths, and empty states turn dead ends into continuations.",
    tags: ["ux", "full-stack"],
    content: `Happy paths get the mockups. Error states get the production screenshots. I design recovery early.

## Classify for the UI

- User-fixable (validation, permissions)
- Transient (network, 503)
- Terminal (not found, permanently denied)

Each class gets different copy and actions. Retry on permanent denial teaches rage.

## Empty is not error

Empty lists need a next step: create, import, learn. Reusing the generic error illustration for emptiness confuses people.

## API honesty

Stable error codes let the client choose. A single \`Something went wrong\` string forces every failure to look the same.

## Preserve user input

After a failed submit, do not wipe the form. That bug alone creates support mail.

Recovery-centered errors make products feel calm under stress. That calm is a feature.`,
  },
  {
    topicId: "ops-cicd",
    cluster: "DevOps & Reliability",
    title: "CI/CD that shortens feedback, not just deploys",
    excerpt:
      "On a small team I automate the checks that catch mistakes fast, then widen the pipeline as risk grows.",
    tags: ["devops", "ci-cd"],
    content: `A pipeline that only deploys is a delivery truck without brakes. I optimize CI/CD for feedback time first.

## Automate the first failures

Lint, typecheck, unit tests, and a smoke build catch most self-inflicted wounds. Put them on every PR. Keep them fast enough that people do not bypass them.

## Deploy as a product habit

Preview deploys or staging pushes turn "works on my machine" into shared evidence. Production deploys need a clear path and an equally clear rollback.

## What I postpone

Elaborate multi-region canaries can wait. A small team needs trustworthy basics more than theater.

## Secrets and environments

Inject secrets at runtime. Do not bake them into images. Separate staging and production credentials even when the architecture is simple.

Fast feedback keeps quality high without heroics. That is the point of the pipeline.`,
  },
  {
    topicId: "ops-self-heal",
    cluster: "DevOps & Reliability",
    title: "What self-healing CI/CD can and cannot fix",
    excerpt:
      "Autonomous recovery helps with flaky infrastructure. It cannot replace understanding a broken product invariant.",
    tags: ["devops", "ai", "reliability"],
    content: `Self-healing pipelines sound like the future: detect failure, retry, revert, reopen. Some of that is useful. Some of it hides the lesson.

## What automation should fix

- Flaky network fetches in builds
- Transient registry or runner outages
- Known quarantine patterns with bounded retries

## What it should not paper over

- Deterministic test failures from real bugs
- Schema migrations that partially applied
- Security scan findings

Retrying a true regression wastes time and trust.

## Guardrails for autonomy

Bound retries, alert humans after N attempts, snapshot logs before revert, and never auto-commit speculative fixes to main without review.

## Research vs production

I am interested in AI-assisted diagnosis. I still require a human for changes that alter product behavior. Healing infrastructure noise is different from rewriting business logic at 3am.

Use self-healing to remove toil, not to remove accountability.`,
  },
];
