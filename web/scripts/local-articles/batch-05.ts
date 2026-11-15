import type { LocalArticle } from "./batch-01";

export const localBatch05: LocalArticle[] = [
  {
    topicId: "mentor-africa",
    cluster: "Mentoring & Career",
    title: "Building technical community from Bamenda outward",
    excerpt:
      "Tutoring, instruction, and ambassador work taught me that community scales through consistent rooms, not one-off hype.",
    tags: ["community", "mentoring"],
    content: `Technical community in Bamenda (and across Cameroon) does not start with a big conference budget. It starts with rooms where people can ask basic questions without shame and leave with a next step.

## Consistency over spectacle

Weekly sessions beat annual fireworks. Learners need repetition and peers who show up. Tutoring and classroom instruction taught me that trust accumulates in small doses.

## Bridge local and global

Microsoft Learn Student Ambassador work exposed students to global curricula while staying rooted in local constraints: bandwidth, device access, and job markets that do not match Silicon Valley blog posts. Good community work translates, it does not cosplay.

## Teach systems, not only syntax

Syntax gets people unstuck today. Systems thinking gets them hired tomorrow. I mix both: ship a small project, then ask what fails when traffic or requirements change.

## Multiplying mentors

The goal is not a personality cult around one instructor. It is peers who can run a session without you. Document exercises. Share rubrics. Hand over the mic.

Community is infrastructure for careers. Build it like infrastructure: reliable, welcoming, and boring in the best way.`,
  },
  {
    topicId: "mentor-alx",
    cluster: "Mentoring & Career",
    title: "What ALX Software Engineering taught me under pressure",
    excerpt:
      "Intensity, collaboration, and fundamentals under deadline still shape how I learn and how I mentor.",
    tags: ["career", "education"],
    content: `ALX Software Engineering was pressure with a syllabus. That combination still influences how I work.

## Fundamentals under load

Data structures, memory, and systems concepts hit differently when the clock is real. The lesson was not only the content. It was learning while tired and still being precise.

## Collaboration as a skill

Group work exposed coordination failures early: unclear ownership, late integration, silent blockers. Those are workplace bugs. Practicing them in a program is cheaper than learning them only on a client project.

## Humility about gaps

Intensity reveals what you skimmed. I still use that signal: if I cannot explain a concept simply, I do not know it yet.

## Mentoring translation

When I teach now, I recreate useful pressure without cruelty: clear deadlines, public demos, code review, and room to fail safely. People grow at the edge of discomfort, not in humiliation.

ALX did not finish my education. It trained a habit of showing up prepared when the work is hard.`,
  },
  {
    topicId: "prod-saas",
    cluster: "Product Building",
    title: "SaaS plans that match real usage",
    excerpt:
      "Credits, trials, and entitlements should map to how people actually consume the product, not to a pretty pricing grid.",
    tags: ["saas", "product"],
    content: `Pricing pages lie when the entitlement system underneath is confused. I design plans from usage reality backward.

## Name the scarce resource

Is it seats, projects, AI credits, storage, or support response time? Pick the scarce thing users feel. Bill around that. Fake differentiators create support tickets.

## Trials that teach the product

A trial should reach the aha moment, not just tick a calendar. Limit the right dimension so people feel value before the wall.

## Entitlements in code

Feature gates read a single entitlement service or table, not scattered if-statements. When sales invents a custom plan, you need a path that does not require a rewrite.

## Credits and fairness

For AI products, show remaining credits and what actions cost. Surprise invoices destroy trust faster than a lower conversion rate.

Match plans to behavior. Pretty tiers with messy metering are a product bug.`,
  },
  {
    topicId: "prod-beta",
    cluster: "Product Building",
    title: "Running a beta without pretending you are done",
    excerpt:
      "Early adopters help when status labels are honest and feedback loops are tight.",
    tags: ["product", "startup"],
    content: `Betas fail when marketing says "launch" and engineering says "please be gentle." I keep the label honest.

## Mark surfaces clearly

Beta badges on unstable areas set expectations. Quietly shipping half-finished billing as GA is how you earn lasting distrust.

## Recruit the right users

Early adopters should tolerate rough edges in exchange for influence. They are not the same as enterprise buyers who need SLAs tomorrow.

## Close the loop weekly

A feedback channel without responses is a suggestion box black hole. Ship visible fixes. Tell people what you postponed and why.

## Exit criteria

Define what "out of beta" means: reliability bar, docs, support path, and a pricing story. Without exit criteria, beta becomes permanent limbo.

Honesty keeps early users on your side while you earn the right to call it done.`,
  },
  {
    topicId: "prod-rebrand",
    cluster: "Product Building",
    title: "Evolving a product name without erasing the work",
    excerpt:
      "UmEmployed becoming Deligon was a continuity problem as much as a design problem.",
    tags: ["product", "branding"],
    content: `A rename looks cosmetic from the outside. Inside it touches domains, emails, OAuth screens, store listings, docs, and muscle memory.

## Preserve the product truth

Deligon is still the skills-first talent intelligence work that existed under the previous name. The rebrand clarifies positioning. It should not orphan case studies or confuse existing users.

## Technical continuity

Redirects, old slugs, email domains, and API hostnames need a migration plan. SEO and bookmarks are part of the product. Breaking them casually is self-sabotage.

## Narrative continuity

Explain why the name changed in one clear story. People forgive evolution. They distrust amnesia.

## Design system catch-up

Update the mark where it matters first: app chrome, auth pages, public site. Lagging surfaces are fine briefly if the plan is sequenced.

Rename with respect for the work already shipped. The brand is a layer. The product is the substance.`,
  },
  {
    topicId: "prod-publishing",
    cluster: "Product Building",
    title: "Multi-platform publishing is a systems problem",
    excerpt:
      "Formats, APIs, brand voice, and scheduling turn one idea into many channel-shaped outputs without chaos.",
    tags: ["product", "ai", "social"],
    content: `Publishing the same idea to several platforms is not copy-paste. Each channel has length, media, and API constraints. JotEcho exists because that mapping is a system.

## Canonical then cast

Keep a source draft. Cast into channel templates with explicit limits. Regenerating from scratch per network invites drift and duplicated effort.

## Scheduling and state

Track per-channel status: drafted, scheduled, published, failed. Partial success is normal. The UI must show which channel needs attention.

## Voice rules as code-adjacent policy

Brand constraints should be enforceable in the casting step, then reviewed by a human for high-stakes posts.

## Failure is a product path

API rate limits and media rejections need retries and clear errors. A "published" checkmark that lies is worse than a visible failure.

Treat publishing as orchestration. Content people feel the difference immediately.`,
  },
  {
    topicId: "prod-nonprofit",
    cluster: "Product Building",
    title: "Websites for nonprofits that need trust, not fluff",
    excerpt:
      "Clear pillars, field stories, and donation paths beat stock-photo hero theater.",
    tags: ["nonprofit", "web"],
    content: `Nonprofit sites often inherit corporate marketing habits: vague slogans, stock smiles, buried donate buttons. Trust needs clearer architecture.

## Lead with who you help and how

Hope Restoration-style storytelling works when field reality is concrete: programs, places, and outcomes a visitor can grasp without decoding jargon.

## Make giving an obvious path

Donation and contact flows should be reachable without a scavenger hunt. Forms must work on slow phones. Receipt and follow-up email matter.

## Accessibility and language

Communities are diverse. Clear language, readable type, and working contrast are respect, not polish.

## Admin for updates

Staff need to publish stories without filing a GitHub issue. A sane content path keeps the site alive after launch week.

Build for trust and action. Fluff is expensive in credibility.`,
  },
  {
    topicId: "prod-ecommerce",
    cluster: "Product Building",
    title: "Retail and wholesale in one storefront",
    excerpt:
      "Specialty food e-commerce taught me that dual audiences need dual paths sharing one catalog truth.",
    tags: ["ecommerce", "product"],
    content: `Retail shoppers and wholesale buyers share inventory but not intent. One generic catalog UX serves both poorly.

## Shared truth, different journeys

Products, stock, and fulfillment can share a backend. Pricing tiers, MOQ, and checkout questions should branch. A restaurant buyer should not fight a gift-shop flow.

## Permissions and visibility

Wholesale pricing is not public decoration. Gate it with accounts and approvals. Leakage creates support and partner pain.

## Ops reality

Packing slips, invoices, and shipping rules differ by channel. Model those early or the storefront will outrun the warehouse process.

## Lessons I keep

Clarity at the entrance (retail vs wholesale) prevents confusion deeper in the funnel. Dual audience is a product design problem before it is a theme customization problem.

One storefront can serve two buyers when the system respects both jobs.`,
  },
  {
    topicId: "django-admin",
    cluster: "Django & Python",
    title: "Django Admin is a product surface if you treat it that way",
    excerpt:
      "Exports, filters, and operator speed turn Admin from a scaffold into a daily tool people trust.",
    tags: ["django", "python"],
    content: `Django Admin is often left as the default scaffolding. Operators live there. I treat it like an internal product.

## Optimize the list view

The right columns, filters, and search fields save hours a week. Show the fields people decide with, not every model attribute.

## Actions and exports

Bulk actions and CSV export are not luxuries. They are how small teams avoid one-off scripts. I have open-sourced export helpers because teams rewrite them endlessly.

## Permissions with intent

Staff status is not a detailed ACL. Map groups to real jobs: support, finance, content. Dangerous actions get confirmations.

## Polish that matters

Readable object names, useful change lists, and short docstrings in the Admin UI reduce training time.

When Admin is cared for, you postpone building a custom ops app until you truly need one.`,
  },
  {
    topicId: "django-export",
    cluster: "Django & Python",
    title: "Why I open-sourced Django admin data export",
    excerpt:
      "CSV export kept getting rewritten. Packaging the pattern once reduced busywork for everyone who found it.",
    tags: ["django", "open-source"],
    content: `Every Django project eventually needs "download these rows as CSV." Teams re-implement it with subtle bugs around encoding, large querysets, and permissions.

## The repeating pain

Ad-hoc exports block the request thread, ignore who is allowed to see rows, or explode memory on big tables. I got tired of reviewing the same footguns.

## What good enough looks like

- Respect Admin permissions
- Stream results when possible
- Stable column ordering
- Predictable filenames
- No surprise N+1 queries

## Why open source

Publishing the package forced clearer docs and reuse. Other teams could install instead of copy-pasting a gist. I still benefit when I start a new project and do not rebuild the wheel.

## Maintenance honesty

Open source is a promise of clarity, not infinite free consulting. Keep the scope tight so the package stays trustworthy.

If a tool solves a recurring tax on Django teams, ship it once and share it.`,
  },
];
