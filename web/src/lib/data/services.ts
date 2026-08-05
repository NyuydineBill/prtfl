export type Service = {
  slug: string;
  name: string;
  shortName: string;
  category: string;
  headline: string;
  description: string;
  summary: string;
  whoFor: string[];
  capabilities: string[];
  process: { title: string; description: string }[];
  fit: string[];
  notAFit: string[];
  relatedProjectSlugs: string[];
  relatedHref: { label: string; href: string };
  cta: string;
};

export const services: Service[] = [
  {
    slug: "ai-product-engineering",
    name: "AI Product Engineering",
    shortName: "AI products",
    category: "AI Systems",
    headline: "Ship AI features that stay reliable in production",
    description:
      "Remote AI product engineering for teams that need LLM workflows, retrieval, and automation wired into real products—not demos.",
    summary:
      "I design and implement AI systems that sit inside production products: ticket triage, recruitment matching, conversational assistants, and recovery workflows. The focus is reliable orchestration, clear service boundaries, and observability—so AI work is maintainable after launch.",
    whoFor: [
      "Product teams adding LLM workflows to an existing SaaS product",
      "Founders who need an end-to-end AI feature without a full in-house AI team",
      "Engineering leads who want production guardrails, not prototype notebooks",
    ],
    capabilities: [
      "LLM integration and multi-step workflow orchestration",
      "Prompt design with human-review paths for high-stakes decisions",
      "FastAPI / Python AI services isolated from core product APIs",
      "Retrieval, scoring, recommendation, and triage pipelines",
      "Deployment, monitoring, and latency-conscious production rollout",
    ],
    process: [
      {
        title: "Scope the decision path",
        description:
          "Clarify what the model should decide, what humans must review, and what failure looks like in the product.",
      },
      {
        title: "Design the service boundary",
        description:
          "Separate AI workloads from core business logic so each can scale, deploy, and fail independently.",
      },
      {
        title: "Build and instrument",
        description:
          "Implement the workflow, wire it into the product UI/API, and add the observability needed to debug real traffic.",
      },
      {
        title: "Harden and hand off",
        description:
          "Tune prompts and recovery paths, document ownership, and leave a system the team can operate.",
      },
    ],
    fit: [
      "You already have a product surface that needs AI assistance",
      "You care about latency, reliability, and reviewability",
      "You want architecture that can grow beyond a single model call",
    ],
    notAFit: [
      "One-off chatbot demos with no product integration",
      "Research-only model training without an application context",
    ],
    relatedProjectSlugs: ["resolvemeq", "umemployed", "ai-chatbot", "self-healing-cicd"],
    relatedHref: { label: "Community & teaching", href: "/community" },
    cta: "Discuss an AI product engagement",
  },
  {
    slug: "full-stack-development",
    name: "Full-Stack Development",
    shortName: "Full-stack",
    category: "Product Engineering",
    headline: "Build web and mobile products end to end",
    description:
      "Remote full-stack development across backend APIs, React/Next.js clients, React Native apps, databases, payments, and cloud deployment.",
    summary:
      "I work across the stack when a product needs coherent delivery: Django/FastAPI backends, React and Next.js frontends, React Native mobile apps, PostgreSQL data models, payments, auth, and cloud deployment. The goal is a shipped system, not a siloed ticket queue.",
    whoFor: [
      "Startups that need a senior engineer who can own a vertical slice",
      "Teams shipping a web dashboard plus mobile companion",
      "Companies that want backend, frontend, and infra kept in sync",
    ],
    capabilities: [
      "Django, Django REST Framework, and FastAPI backends",
      "React and Next.js product interfaces",
      "React Native apps shipped to Play Store and App Store",
      "Auth, payments, PostgreSQL modeling, and API design",
      "Docker-based deployment on Azure and AWS",
    ],
    process: [
      {
        title: "Map the product surface",
        description:
          "Identify users, critical flows, and the smallest architecture that can ship without boxing the team in later.",
      },
      {
        title: "Build the vertical slice",
        description:
          "Implement API, data model, and UI together so the product stays coherent from day one.",
      },
      {
        title: "Integrate real-world concerns",
        description:
          "Add authentication, billing, admin workflows, and the operational pieces products actually need.",
      },
      {
        title: "Deploy and stabilize",
        description:
          "Ship to cloud environments with CI, monitoring, and a clear path for iteration.",
      },
    ],
    fit: [
      "You need a builder who can move across backend, frontend, and mobile",
      "You value production delivery over framework fashion",
      "You want clean boundaries that other engineers can extend",
    ],
    notAFit: [
      "Pure design-only or marketing-site-only work",
      "Staff augmentation for tiny unrelated tickets with no ownership",
    ],
    relatedProjectSlugs: ["resolvemeq", "umemployed", "malegado", "yamo", "landlordnde24", "z-learn"],
    relatedHref: { label: "Technical stack", href: "/stack" },
    cta: "Discuss a full-stack engagement",
  },
  {
    slug: "software-architecture-consulting",
    name: "Software Architecture Consulting",
    shortName: "Architecture",
    category: "Architecture",
    headline: "Design systems that extend instead of being rewritten",
    description:
      "Remote software architecture consulting for service boundaries, distributed systems design, and production infrastructure decisions.",
    summary:
      "I spend more time on system design than on any single line of implementation. That shows up in modular SaaS platforms, national-scale trust systems, and research into autonomous CI/CD recovery. Architecture work here means concrete boundaries, trade-offs, and a path to implementation.",
    whoFor: [
      "Founders validating architecture before a major build",
      "Teams refactoring a growing monolith or multi-service system",
      "Organizations planning cloud, CI/CD, and reliability foundations",
    ],
    capabilities: [
      "Service boundary and modular architecture design",
      "API and data modeling for long-lived products",
      "Cloud infrastructure planning across Azure and AWS",
      "CI/CD, observability, and reliability considerations",
      "Architecture reviews with clear recommended next steps",
    ],
    process: [
      {
        title: "Audit constraints",
        description:
          "Review current systems, team capacity, timelines, and the real non-negotiables before proposing structure.",
      },
      {
        title: "Propose the target shape",
        description:
          "Define services, ownership, data flow, and the deployment model that fits the product stage.",
      },
      {
        title: "Sequence the work",
        description:
          "Break the architecture into an implementation order that reduces rewrite risk.",
      },
      {
        title: "Support the build",
        description:
          "Stay involved through design reviews or hands-on implementation where useful.",
      },
    ],
    fit: [
      "You need a senior view before expensive implementation choices lock in",
      "You want architecture that matches team size and product stage",
      "You care about reliability and operability, not just diagrams",
    ],
    notAFit: [
      "Slide-deck architecture with no connection to shipping",
      "Rubber-stamping decisions that have already been locked politically",
    ],
    relatedProjectSlugs: [
      "cameroon-digital-trust-network",
      "resolvemeq",
      "self-healing-cicd",
      "umemployed",
    ],
    relatedHref: { label: "Experience timeline", href: "/experience" },
    cta: "Discuss an architecture engagement",
  },
  {
    slug: "engineering-mentoring",
    name: "Engineering Mentoring",
    shortName: "Mentoring",
    category: "Education",
    headline: "Practical mentoring for engineers who want stronger systems thinking",
    description:
      "Remote engineering mentoring and technical coaching grounded in real tutoring, IT instruction, and student-ambassador leadership experience.",
    summary:
      "Alongside product work, I teach and mentor: one-on-one programming tutoring on Preply, IT instruction for working professionals, and leadership of the Microsoft Learn Student Ambassadors chapter at the University of Bamenda. Mentoring here is practical—architecture judgment, debugging, and project delivery.",
    whoFor: [
      "Early-career engineers who want stronger systems and architecture instincts",
      "Students building portfolio-grade projects with production habits",
      "Teams looking for structured technical coaching, not motivational talks",
    ],
    capabilities: [
      "One-on-one mentoring on software engineering and architecture",
      "Project reviews with concrete technical feedback",
      "Guidance on web development, algorithms, and debugging",
      "Curriculum-style learning paths adapted to the learner",
      "Community and chapter leadership practices for technical groups",
    ],
    process: [
      {
        title: "Assess the starting point",
        description:
          "Understand current skills, goals, and the projects or interviews the learner is working toward.",
      },
      {
        title: "Set a focused plan",
        description:
          "Pick a small set of high-leverage topics: systems thinking, project structure, or delivery habits.",
      },
      {
        title: "Work on real artifacts",
        description:
          "Review code, architecture notes, and project decisions instead of staying in abstract theory.",
      },
      {
        title: "Iterate with feedback",
        description:
          "Leave each session with clear next actions and measurable improvement targets.",
      },
    ],
    fit: [
      "You want technical depth, not soft-skill-only coaching",
      "You can bring real projects or problems to discuss",
      "You are ready to practice between sessions",
    ],
    notAFit: [
      "Homework outsourcing with no learning intent",
      "Interview answer memorization without understanding",
    ],
    relatedProjectSlugs: ["z-learn", "data2csv"],
    relatedHref: { label: "Teaching & leadership", href: "/community" },
    cta: "Discuss mentoring",
  },
];

export function getService(slug: string) {
  return services.find((service) => service.slug === slug);
}

export function servicesForProject(projectSlug: string) {
  return services.filter((service) => service.relatedProjectSlugs.includes(projectSlug));
}
