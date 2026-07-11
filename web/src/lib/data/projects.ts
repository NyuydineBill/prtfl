export type ProjectLink = { label: string; href: string; kind: "github" | "demo" | "package" };

export type Project = {
  slug: string;
  name: string;
  category: string;
  role: string;
  period: string;
  status: string;
  featured?: boolean;
  summary: string;
  overview: string;
  problem?: string;
  solution?: string;
  highlights?: string[];
  keyFeatures?: string[];
  engineeringHighlights?: string[];
  challenges?: string[];
  impact?: string;
  stack: string[];
  diagram?: string[];
  hasVisual?: boolean;
  links?: ProjectLink[];
};

// Sourced from the résumé and direct project write-ups. Add more entries
// here as they're ready — the list and detail pages render off this array.
// Sections render only when present, so depth varies honestly by how much
// source material exists for each project.
export const projects: Project[] = [
  {
    slug: "self-healing-cicd",
    name: "Self-Healing CI/CD Pipelines Using AI",
    category: "Research · Artificial Intelligence · DevOps",
    role: "Sole Researcher & Engineer · B.Eng. Final-Year Research",
    period: "2025 – 2026",
    status: "Research project",
    featured: true,
    summary:
      "My Bachelor's Engineering research project: making CI/CD pipelines autonomous by detecting failures, identifying root causes, and recommending or executing recovery, without manual developer intervention.",
    overview:
      "My Bachelor's Engineering research project, and one of the strongest demonstrations of my software engineering and AI capabilities. It explores how AI can make CI/CD pipelines autonomous by detecting failures, identifying root causes, and automatically recommending or executing recovery actions, reducing developer intervention and increasing deployment reliability.",
    problem:
      "Modern CI/CD pipelines regularly fail because of dependency conflicts, infrastructure failures, configuration mistakes, flaky tests, build failures, and deployment issues. These failures consume engineering time because developers have to manually inspect logs and work out the right fix.",
    solution:
      "Designed a self-healing pipeline framework capable of detecting failures automatically, collecting and analyzing build logs, identifying probable root causes, selecting an appropriate recovery strategy, validating that recovery worked, and returning the pipeline to a healthy state.",
    keyFeatures: [
      "Automated failure detection",
      "Intelligent log analysis",
      "Root cause classification",
      "AI-assisted recovery",
      "Rule-based remediation",
      "Recovery validation",
      "Modular architecture",
    ],
    engineeringHighlights: [
      "Software Architecture",
      "Artificial Intelligence",
      "Automation",
      "DevOps",
      "Distributed Systems",
      "Reliability Engineering",
    ],
    impact:
      "Forms the core of my B.Eng. research work: a framework for reducing manual log inspection and mean-time-to-recovery in CI/CD pipelines through AI-assisted automation.",
    stack: ["Python", "Docker", "GitHub Actions", "Jenkins", "Kubernetes", "Machine Learning", "Log Analysis"],
    diagram: [
      "Pipeline failure",
      "Collect build logs",
      "Analyze logs",
      "Classify root cause",
      "Select recovery strategy",
      "Execute recovery",
      "Validate & restore",
    ],
    links: [
      { label: "View on GitHub", href: "https://github.com/NyuydineBill/self-healing-cicd", kind: "github" },
      { label: "pip install self-healing-cicd", href: "https://pypi.org/project/self-healing-cicd/", kind: "package" },
    ],
  },
  {
    slug: "resolvemeq",
    name: "ResolveMeQ",
    category: "SaaS · Artificial Intelligence · Founder",
    role: "Founder, Sole Architect & Engineer",
    period: "2025 – Present",
    status: "Beta · early adopters",
    featured: true,
    summary:
      "AI-powered SaaS platform for IT-helpdesk automation, taken from concept to a deployed beta.",
    overview:
      "ResolveMeQ automates IT-helpdesk ticket triage and resolution. It's architected as a modular, service-oriented system so the AI workload, the core business logic, and the client can each be built, deployed, and scaled independently.",
    hasVisual: true,
    highlights: [
      "Designed the architecture up front as a modular, service-oriented system, separating the Django core API, a FastAPI AI service, and the React client into independently deployable services, keeping AI workloads isolated and each piece free to scale on its own.",
      "Built the Django backend and REST API with authentication, authorization, subscription billing via DODO Payments, and the core business logic, backed by a normalized PostgreSQL schema with indexing and query tuning for ticket and workflow data.",
      "Designed and deployed the FastAPI AI microservices that analyze, triage, and resolve support tickets, orchestrating the multi-step AI workflow behind automated resolution at production latency.",
      "Developed the React application, including operator dashboards built around real support-team workflows and a reusable component library, alongside SEO-focused Next.js marketing pages.",
      "Deployed the platform to the cloud with environment configuration, monitoring, and CI, and continue to handle releases, performance tuning, and maintenance. Currently in beta with early adopters, with pitch materials prepared for a pre-seed raise.",
    ],
    engineeringHighlights: ["Software Architecture", "Artificial Intelligence", "Full-Stack Engineering", "Cloud Infrastructure"],
    stack: ["Django", "Django REST Framework", "FastAPI", "React", "Next.js", "PostgreSQL", "Docker"],
    links: [{ label: "Visit resolvemeq.net", href: "https://resolvemeq.net", kind: "demo" }],
  },
  {
    slug: "data2csv",
    name: "Data2CSV",
    category: "Open Source · Python · Django",
    role: "Creator & Maintainer",
    period: "Open source",
    status: "Open-source package",
    featured: true,
    summary:
      "Published on PyPI as django-admin-data-export: a reusable Django package that adds CSV, Excel, and JSON export to Django Admin, so developers stop rewriting export logic for every project.",
    overview:
      "Data2CSV (published on PyPI as django-admin-data-export) is a reusable Django package I built to simplify exporting Django Admin data. Instead of rewriting export functionality for every project, developers install the package and immediately gain CSV, Excel, and JSON export inside Django Admin.",
    problem:
      "Django developers frequently duplicate export code across projects because Django Admin doesn't provide a reusable export solution by default.",
    solution:
      "Built a reusable package that integrates directly with Django Admin and exports filtered QuerySets to CSV, Excel, and JSON with minimal configuration.",
    keyFeatures: [
      "One-click CSV, Excel, and JSON export",
      "Generic model support",
      "Filter-aware exports",
      "Dynamic field generation",
      "Reusable package",
      "Lightweight implementation",
    ],
    engineeringHighlights: ["Open-Source Engineering", "Package Design", "Developer Tooling", "Django Ecosystem"],
    challenges: [
      "Generic queryset handling",
      "Dynamic model introspection",
      "Django Admin integration",
      "Package architecture",
      "Developer experience",
    ],
    impact:
      "Install it once, and any Django Admin gains multi-format export without custom code: a small, focused contribution to the Django open-source ecosystem, published and versioned on PyPI.",
    stack: ["Python", "Django", "Django Admin", "Packaging", "CSV", "Excel", "JSON"],
    links: [
      { label: "View on GitHub", href: "https://github.com/NyuydineBill/data2csv", kind: "github" },
      { label: "pip install django-admin-data-export", href: "https://pypi.org/project/django-admin-data-export/", kind: "package" },
    ],
  },
  {
    slug: "umemployed",
    name: "UmEmployed",
    category: "SaaS · Artificial Intelligence · Full Stack",
    role: "Full-Stack & AI Engineer",
    period: "2023 – 2026",
    status: "Live · production, 500+ users",
    featured: false,
    summary:
      "USA-based AI recruitment platform. Built the backend, frontend, mobile app, and AI pipeline as one connected product.",
    overview:
      "UmEmployed matches candidates to jobs using a connected pipeline of AI models rather than isolated scripts: resume parsing, scoring, job matching, and recommendations feeding straight into the web dashboards and the mobile app.",
    hasVisual: true,
    highlights: [
      "Designed and built the Django and Django REST Framework backend: API architecture, OAuth2-based authentication and authorization, and Stripe/PayPal payment integration.",
      "Built React dashboard interfaces that surface the platform's AI outputs (resume scores, match results, recommendations) in a form recruiters and candidates could act on directly.",
      "Built the cross-platform React Native app end to end and shipped it to both the Google Play Store and Apple App Store, including release management and production maintenance.",
      "Built resume parsing, resume scoring, AI job matching, skill extraction, an AI recommendation system, MCQ interview-question generation, a Career Roadmap engine, and a Skills Guide engine.",
      "Deployed on Azure and Docker, migrated to PostgreSQL with Alembic, and maintained CI/CD and infrastructure across AWS S3, RDS, Lambda, and IAM.",
      "Deployed 6+ AI models at over 85% accuracy for résumé scoring, job matching, and personalized recommendations, in production use by 500+ users.",
    ],
    engineeringHighlights: ["Artificial Intelligence", "Mobile Engineering", "Full-Stack Engineering", "Cloud Infrastructure"],
    stack: ["Django", "Django REST Framework", "React", "React Native", "PostgreSQL", "Azure", "AWS", "Docker"],
    links: [{ label: "Visit umemployed.com", href: "https://www.umemployed.com", kind: "demo" }],
  },
  {
    slug: "ai-chatbot",
    name: "AI Chatbot",
    category: "Artificial Intelligence · Full Stack",
    role: "Full-Stack & AI Engineer",
    period: "Personal project",
    status: "AI product",
    summary:
      "Conversational AI assistant using LLMs for natural-language understanding, context retrieval, and intelligent response generation.",
    overview:
      "A conversational AI assistant capable of understanding natural language, retrieving relevant context, and generating intelligent responses using Large Language Models, demonstrating practical Generative AI applied within production-style software.",
    problem:
      "Traditional search systems struggle to provide contextual, conversational responses. Users want intelligent assistants capable of understanding questions naturally.",
    solution:
      "Built an AI chatbot with natural language understanding, context retrieval, conversational memory, intelligent response generation, an API-based architecture, and a modern frontend interface.",
    keyFeatures: [
      "Chat interface",
      "Context-aware conversations",
      "Knowledge retrieval",
      "Conversation history",
      "Streaming responses",
      "REST API",
    ],
    engineeringHighlights: ["Artificial Intelligence", "Full-Stack Engineering", "API Design", "Prompt Engineering"],
    challenges: [
      "Prompt engineering",
      "Context management",
      "Hallucination reduction",
      "API optimization",
      "Frontend/backend communication",
    ],
    stack: ["Python", "FastAPI", "React", "OpenAI API", "PostgreSQL", "REST APIs"],
    links: [{ label: "View on GitHub", href: "https://github.com/NyuydineBill/AI-Chatbot", kind: "github" }],
  },
  {
    slug: "dct-image-compression",
    name: "Image Compression Using DCT",
    category: "Computer Vision · Algorithms · Image Processing",
    role: "Software Engineer",
    period: "Personal project",
    status: "Algorithms & systems",
    summary:
      "JPEG-style image compression pipeline built from scratch using the Discrete Cosine Transform.",
    overview:
      "Implemented an image compression system based on the JPEG compression pipeline using the Discrete Cosine Transform (DCT), demonstrating digital signal processing and mathematical algorithm work beyond typical web development.",
    problem:
      "High-resolution images require significant storage and bandwidth. Compression needs to reduce file size while maintaining acceptable visual quality.",
    solution:
      "Implemented the complete compression pipeline: block processing, forward DCT, quantization, frequency reduction, inverse DCT, and image reconstruction.",
    keyFeatures: [
      "DCT implementation",
      "Compression pipeline",
      "Image reconstruction",
      "Compression ratio analysis",
      "Quality evaluation",
    ],
    engineeringHighlights: ["Algorithms", "Digital Signal Processing", "Computer Vision", "Mathematical Modeling"],
    challenges: [
      "Matrix transformations",
      "Frequency-domain analysis",
      "Quantization tuning",
      "Compression-quality tradeoffs",
      "Performance optimization",
    ],
    stack: ["Python", "NumPy", "OpenCV", "Pillow"],
    diagram: [
      "Input image",
      "Block split (8×8)",
      "Forward DCT",
      "Quantization",
      "Frequency reduction",
      "Inverse DCT",
      "Reconstructed image",
    ],
    links: [{ label: "View on GitHub", href: "https://github.com/NyuydineBill/DCT-image-compression", kind: "github" }],
  },
  {
    slug: "malegado",
    name: "Malegado",
    category: "Frontend · Production Engineering",
    role: "Frontend & Production Engineer · Skye8",
    period: "2025",
    status: "Production",
    summary:
      "Production Next.js marketing site with SEO optimization, dynamic routing, and production support, built as part of my Skye8 engagement.",
    overview:
      "Built production Next.js landing pages and dynamic routing for Malegado, with SEO optimization, sitemap generation, and public indexing, alongside authentication improvements, deployment support, performance optimization, and production debugging.",
    highlights: [
      "Built production Next.js landing pages and dynamic routing.",
      "Implemented SEO optimization, sitemap generation, and public indexing.",
      "Handled authentication improvements, deployment support, performance optimization, and production debugging.",
    ],
    stack: ["Next.js", "React", "SEO"],
    links: [{ label: "Visit malegado.com", href: "https://malegado.com", kind: "demo" }],
  },
  {
    slug: "cameroon-digital-trust-network",
    name: "Cameroon Digital Trust Network",
    category: "Research & Development · Enterprise Architecture",
    role: "Lead Architect · Independent",
    period: "R&D",
    status: "Architecture & R&D · not deployed",
    summary:
      "Enterprise architecture initiative for a national-scale, AI-powered digital trust and verification platform.",
    overview:
      "An independent R&D initiative designing the long-term architecture for a national-scale digital trust and verification platform: reasoning, verification, correlation, intelligence, and policy as separate layers with defined component boundaries, planned for phased implementation rather than built as a live system.",
    highlights: [
      "Designed the long-term architecture as modular reasoning, verification, correlation, intelligence, and policy layers with defined component boundaries and integration contracts, planned for phased implementation and scale.",
      "Designed the AI architecture: an Explainable AI reasoning engine and a Trust Intelligence Pipeline spanning evidence correlation, multi-engine risk scoring, and knowledge- and policy-driven verification, with transparency, auditability, and access control as first-class design concerns.",
      "Drove the technical decisions and authored the architecture documentation, including governance guardrails such as mandatory human review for sensitive assessments.",
    ],
    engineeringHighlights: ["System Design", "Explainable AI", "Distributed Systems", "Policy & Governance"],
    stack: ["System Design", "Explainable AI", "Distributed Systems", "Policy & Governance"],
  },
  {
    slug: "z-learn",
    name: "Z-Learn",
    category: "EdTech · Full Stack",
    role: "Backend Architect · ZiloTech",
    period: "2023 – 2025",
    status: "Production · 20+ releases",
    summary:
      "EdTech platform with AI-powered tutoring modules that personalize learning paths per student.",
    overview:
      "Z-Learn's backend was built to support AI-driven personalization from day one: a normalized schema and REST API designed to carry tutoring, enrollment, and billing without becoming a bottleneck as the AI modules grew.",
    highlights: [
      "Architected and built the backend with Django REST Framework, JWT authentication, and PostgreSQL.",
      "Built AI-powered tutoring modules that personalize learning paths per student.",
      "Integrated local payment channels for course enrollment and billing.",
      "Automated build-test-deploy with Azure DevOps Pipelines across 20+ releases (2024–2025).",
    ],
    stack: ["Django REST Framework", "PostgreSQL", "JWT", "Azure DevOps"],
  },
  {
    slug: "yamo",
    name: "Yamo",
    category: "Food Delivery · Mobile",
    role: "Mobile & Backend Engineer · ZiloTech",
    period: "2025",
    status: "Live · 1,000+ downloads",
    summary:
      "Food delivery app with real-time order tracking, released to the Google Play Store in April 2025.",
    overview:
      "Yamo pairs a React Native ordering app with a Django backend and a companion React site, built around real-time order tracking and secure payment for local food delivery.",
    highlights: [
      "Built the React Native app and Django backend with real-time order tracking and secure payment integration.",
      "Built a companion React website alongside the mobile app.",
      "Released Yamo v1.0 to the Google Play Store in April 2025, reaching 1,000+ downloads.",
    ],
    stack: ["React Native", "Django", "PostgreSQL"],
  },
  {
    slug: "landlordnde24",
    name: "LandlordNde24",
    category: "Property Tech · Mobile",
    role: "Mobile Engineer · Freelance",
    period: "2024 – 2025",
    status: "Live · Google Play & Apple App Store",
    summary:
      "Property-tech mobile app for landlords, shipped to both major app stores.",
    overview:
      "A React Native property-management app built and shipped independently, including ongoing release management once it was live on both stores.",
    highlights: [
      "Deployed the React Native app to both the Google Play Store and Apple App Store.",
      "Managed release cycles and production maintenance as an independent freelance engagement.",
    ],
    stack: ["React Native"],
  },
];
