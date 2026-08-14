export type ExperienceEntry = {
  role: string;
  org: string;
  location: string;
  period: string;
  summary?: string;
  highlights: string[];
};

export const experience: ExperienceEntry[] = [
  {
    role: "Full-Stack & AI Engineer",
    org: "UmEmployed",
    location: "USA (Remote)",
    period: "2023 – 2026",
    summary:
      "Worked across backend, frontend, mobile, AI, and cloud engineering on a single recruitment platform, building each layer to function as one coherent product.",
    highlights: [
      "Designed and built the Django and Django REST Framework backend, including API architecture, OAuth2-based authentication, and Stripe/PayPal payment integration.",
      "Built React dashboard interfaces that surface the platform's AI outputs (resume scores, match results, recommendations) in a form recruiters and candidates could act on directly.",
      "Built the cross-platform React Native app end to end, shipped it to both the Google Play Store and Apple App Store, and maintained it in production.",
      "Built resume parsing, resume scoring, AI job matching, skill extraction, an AI recommendation system, MCQ interview-question generation, a Career Roadmap engine, and a Skills Guide engine.",
      "Deployed on Azure and Docker, migrated databases to PostgreSQL with Alembic, and maintained CI/CD and infrastructure across AWS S3, RDS, Lambda, and IAM.",
      "Deployed 6+ AI models at over 85% accuracy for résumé scoring, job matching, and personalized recommendations, in production use by 500+ users.",
    ],
  },
  {
    role: "Software Engineer, AI & Frontend",
    org: "Skye8",
    location: "Remote",
    period: "2025",
    highlights: [
      "Built a plagiarism-checker microservice using NLP and FastAPI, containerized with Docker and integrated via REST and gRPC endpoints.",
      "Automated CI/CD workflows with GitHub Actions, cutting deployment time by 40%, and built Grafana dashboards for real-time monitoring.",
      "Built production Next.js landing pages with dynamic routing, SEO optimization, and sitemap generation for public indexing.",
    ],
  },
  {
    role: "Full-Stack Engineer",
    org: "ZiloTech",
    location: "Cameroon",
    period: "2023 – 2025",
    summary:
      "Delivered multiple production products end to end across EdTech and food delivery, from backend design through mobile and cloud deployment.",
    highlights: [
      "Z-Learn (EdTech): architected the Django REST backend with JWT authentication and PostgreSQL, plus AI-powered tutoring modules that personalize learning paths per student.",
      "Yamo (Food Delivery): built the React Native app and Django backend with real-time order tracking and secure payment integration; deployed to the Google Play Store, reaching 1,000+ downloads.",
      "Designed and trained recommendation systems and customer-insight models, evaluated against live usage.",
      "Built CI/CD with GitHub Actions and Docker, managing infrastructure across Azure App Services, AWS EC2, S3, and Azure Blob Storage.",
    ],
  },
  {
    role: "Full-Stack Software Engineer",
    org: "Various US Clients",
    location: "USA (Remote)",
    period: "2023 – Present",
    highlights: [
      "Designed and shipped web applications with Django, React, and Tailwind CSS, deployed with Kubernetes Helm and GitHub Actions.",
      "Engineered production client websites including Anedian Group LLC (U.S. African food e-commerce), Hope Restoration, and the Faye Suleiman Foundation.",
      "Integrated third-party APIs including Stripe and Twilio, collaborated in agile teams maintaining 90% test coverage, and mentored junior developers.",
    ],
  },
  {
    role: "Mobile Engineer",
    org: "LandlordNde24",
    location: "Property Tech · Freelance",
    period: "2024 – 2025",
    highlights: [
      "Deployed the LandlordNde24 React Native app to both the Google Play Store and Apple App Store; managed release cycles and production maintenance.",
    ],
  },
  {
    role: "Open Source Contributor",
    org: "Daytona & Outreachy (Fedora)",
    location: "Freelance",
    period: "2024 – 2025",
    highlights: [
      "Contributed backend modules to Daytona, an open-source development-environment platform, working alongside its core maintainers on container orchestration features.",
      "Improved core modules, test coverage, and documentation under Outreachy (Fedora OS), and helped streamline onboarding for incoming contributors.",
    ],
  },
];
