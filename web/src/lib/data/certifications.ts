export type Certification = {
  name: string;
  org: string;
  period: string;
  summary?: string;
  skills?: string[];
  featured?: boolean;
  // Drop the certificate image in /public/certifications/ and reference it here.
  certificateImage?: string;
};

export const certifications: Certification[] = [
  {
    name: "Certified Software Engineer, ALX Software Engineering Program",
    org: "ALX Africa",
    period: "2023 – 2024",
    featured: true,
    summary:
      "Completed the intensive ALX Software Engineering Program: full-stack software engineering, Linux systems, algorithms, data structures, databases, networking, DevOps fundamentals, and collaborative software development.",
    skills: [
      "Full-stack software engineering",
      "Software architecture",
      "Linux",
      "Git and GitHub",
      "Databases",
      "APIs",
      "Backend development",
      "Frontend development",
      "System design",
      "Problem solving",
    ],
  },
  {
    name: "Azure Cloud Analyst",
    org: "Microsoft Learn Student Ambassadors",
    period: "2023 – 2024",
  },
];
