export type LeadershipRole = {
  role: string;
  org: string;
  institution: string;
  logo?: string;
  summary: string;
  responsibilities: string[];
  skills: string[];
};

export const leadership: LeadershipRole[] = [
  {
    role: "Microsoft Learn Student Ambassador",
    org: "Microsoft Learn Student Ambassadors",
    institution: "University of Bamenda",
    summary:
      "Served as the Microsoft Learn Student Ambassador representative for the University of Bamenda, promoting Microsoft technologies, organizing learning initiatives, supporting fellow students, and encouraging participation in technical communities.",
    responsibilities: [
      "Organized technical learning activities",
      "Promoted Microsoft Learn resources",
      "Guided students through technical learning paths",
      "Encouraged community participation",
      "Supported peer learning and mentorship",
    ],
    skills: [
      "Leadership",
      "Public speaking",
      "Community building",
      "Technical mentoring",
      "Event coordination",
    ],
  },
];
