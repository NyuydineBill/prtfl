export type Resource = {
  slug: string;
  title: string;
  kind: "book" | "cheatsheet" | "hack" | "guide";
  summary: string;
  level: "beginner" | "intermediate" | "advanced";
  topics: string[];
  href?: string;
  status: "live" | "coming-soon";
};

export const resources: Resource[] = [
  {
    slug: "system-design-reading-path",
    title: "System design reading path",
    kind: "book",
    summary:
      "A short list of books and chapters worth extracting patterns from, not finishing for completionism.",
    level: "intermediate",
    topics: ["architecture", "system-design"],
    status: "coming-soon",
  },
  {
    slug: "git-weekly-cheatsheet",
    title: "Git commands I type weekly",
    kind: "cheatsheet",
    summary: "A compact set of restore, rebase, stash, and bisect commands that earn their keep.",
    level: "beginner",
    topics: ["git"],
    status: "coming-soon",
  },
  {
    slug: "postgres-debug-cheatsheet",
    title: "PostgreSQL debugging cheatsheet",
    kind: "cheatsheet",
    summary: "Explain, indexes, locks, and connection checks before you blame the application layer.",
    level: "intermediate",
    topics: ["postgresql"],
    status: "coming-soon",
  },
  {
    slug: "llm-production-hacks",
    title: "LLM production hacks",
    kind: "hack",
    summary:
      "Practical habits for prompts, evals, isolation, and cost control when AI features leave the demo stage.",
    level: "advanced",
    topics: ["ai", "llms"],
    status: "coming-soon",
  },
  {
    slug: "saas-launch-checklist",
    title: "SaaS launch checklist",
    kind: "guide",
    summary: "Auth, payments, SEO, observability, and support paths before inviting early adopters.",
    level: "intermediate",
    topics: ["saas", "product"],
    status: "coming-soon",
  },
  {
    slug: "linux-triage-cheatsheet",
    title: "Linux triage before blaming the app",
    kind: "cheatsheet",
    summary: "Disk, memory, ports, and process checks that save hours during incidents.",
    level: "intermediate",
    topics: ["linux", "devops"],
    status: "coming-soon",
  },
];

export const resourceKinds = ["book", "cheatsheet", "hack", "guide"] as const;
