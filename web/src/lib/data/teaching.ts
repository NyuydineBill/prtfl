export type TeachingRole = {
  role: string;
  org: string;
  logo?: string;
  period: string;
  summary: string;
  responsibilities: string[];
  skills: string[];
  photos: string[];
};

export const teaching: TeachingRole[] = [
  {
    role: "Software Engineering & Programming Tutor",
    org: "Preply",
    period: "Ongoing",
    summary:
      "Work as an online programming tutor on Preply, helping students understand software engineering concepts through one-on-one lessons: programming fundamentals, web development, algorithms, debugging, project architecture, and software engineering best practices.",
    responsibilities: [
      "Deliver personalized programming lessons",
      "Explain software engineering concepts clearly",
      "Guide students through real-world coding projects",
      "Review code and provide technical feedback",
      "Help learners improve problem-solving skills",
      "Mentor beginners and intermediate developers",
    ],
    skills: [
      "Technical communication",
      "Mentoring",
      "Curriculum adaptation",
      "Software engineering",
      "Programming education",
    ],
    photos: [],
  },
  {
    role: "IT Instructor",
    org: "North West Regional Assembly",
    period: "2 months",
    summary:
      "Delivered practical computer and digital literacy training to staff and participants at the North West Regional Assembly, focused on improving workplace productivity through technology.",
    responsibilities: [
      "Prepared and delivered IT lessons",
      "Introduced participants to essential computer skills",
      "Taught productivity tools and software usage",
      "Assisted learners during practical sessions",
      "Supported participants with hands-on exercises",
    ],
    skills: ["Instruction", "Digital literacy training", "Hands-on facilitation"],
    photos: ["/teaching/nwra-training-1.jpg", "/teaching/nwra-training-2.jpg"],
  },
];
