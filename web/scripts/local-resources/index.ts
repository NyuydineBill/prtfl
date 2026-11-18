/**
 * Handwritten resources for the /resources library.
 * Bodies live in ./content/<slug>.md so Markdown and code fences need no escaping.
 * Voice: plain and direct, no invented personal claims. No em/en dashes.
 */
import type { ResourceLevel } from "../../src/lib/resources";

export type LocalResource = {
  slug: string;
  title: string;
  kind: string;
  summary: string;
  level: ResourceLevel;
  topics: string[];
  sort_order: number;
};

export const localResources: LocalResource[] = [
  {
    slug: "practical-rest-api-handbook",
    title: "The Practical REST API Handbook",
    kind: "guide",
    summary:
      "HTTP methods, status codes, request and response structure, authentication, pagination, error handling, versioning and the design principles that keep an API predictable. For backend and full-stack developers.",
    level: "intermediate",
    topics: ["api-design", "http", "backend"],
    sort_order: 1,
  },
  {
    slug: "git-github-field-guide",
    title: "Git & GitHub: The Developer's Field Guide",
    kind: "guide",
    summary:
      "Everyday commands, branching, merging, rebasing, pull requests, conflict resolution and team workflows, starting from the mental model that makes the rest click. For students, junior and intermediate developers.",
    level: "beginner",
    topics: ["git", "github", "collaboration"],
    sort_order: 2,
  },
  {
    slug: "system-design-fundamentals",
    title: "System Design Fundamentals for Working Developers",
    kind: "guide",
    summary:
      "Scalability, databases, caching, queues, load balancing, reliability and the trade-offs between them, with a worked example. For engineers preparing for real-world systems work and interviews.",
    level: "intermediate",
    topics: ["system-design", "architecture", "scalability"],
    sort_order: 3,
  },
  {
    slug: "ai-prototype-to-production",
    title: "From AI Prototype to Production",
    kind: "guide",
    summary:
      "Model integration, inference APIs, evaluation, monitoring, latency, failure handling and responsible deployment. What changes between a demo that works and a feature people rely on. For software engineers integrating AI into products.",
    level: "intermediate",
    topics: ["ai", "llm", "production"],
    sort_order: 4,
  },
  {
    slug: "django-practical-reference",
    title: "Django Developer's Practical Reference",
    kind: "guide",
    summary:
      "Models, the ORM, serializers, views, authentication, permissions, testing, performance and deployment, with patterns that hold up in day-to-day Django and Django REST Framework work. For Python and Django developers.",
    level: "intermediate",
    topics: ["django", "python", "drf"],
    sort_order: 5,
  },
];
