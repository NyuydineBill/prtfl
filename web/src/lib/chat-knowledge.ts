import { profile } from "@/lib/data/profile";
import { projects } from "@/lib/data/projects";
import { experience } from "@/lib/data/experience";
import { skillGroups } from "@/lib/data/skills";
import { teaching } from "@/lib/data/teaching";
import { leadership } from "@/lib/data/leadership";
import { certifications } from "@/lib/data/certifications";

// A single grounded knowledge base assembled from the site's own content
// data, fed into the chat assistant's system prompt so it can only answer
// from real facts about Nyuydine, not invent them.
export function buildKnowledgeBase() {
  const sections: string[] = [];

  sections.push(`# Profile
Name: ${profile.name}
Role: ${profile.role}
Location: ${profile.location}
Summary: ${profile.summary}
Core expertise: ${profile.expertise.map((e) => `${e.title} — ${e.description}`).join(" | ")}
Domains: ${profile.domains.join(", ")}
Education: ${profile.education.map((e) => `${e.credential}, ${e.institution} (${e.period})`).join("; ")}`);

  sections.push(`# Projects\n${projects
    .map(
      (p) =>
        `- ${p.name} (${p.category}, ${p.role}, ${p.period}, status: ${p.status}): ${p.overview}`
    )
    .join("\n")}`);

  sections.push(`# Work experience\n${experience
    .map(
      (e) =>
        `- ${e.role} at ${e.org} (${e.location}, ${e.period}): ${e.summary ?? ""} ${e.highlights.join(" ")}`
    )
    .join("\n")}`);

  sections.push(`# Technical stack\n${skillGroups
    .map((g) => `${g.category}: ${g.items.join(", ")}`)
    .join("\n")}`);

  sections.push(`# Teaching\n${teaching
    .map((t) => `- ${t.role} at ${t.org} (${t.period}): ${t.summary}`)
    .join("\n")}`);

  sections.push(`# Leadership\n${leadership
    .map((l) => `- ${l.role}, ${l.org} at ${l.institution}: ${l.summary}`)
    .join("\n")}`);

  sections.push(`# Certifications\n${certifications
    .map((c) => `- ${c.name}, ${c.org} (${c.period})`)
    .join("\n")}`);

  sections.push(`# Contact\nEmail: ${profile.email}\nGitHub: ${profile.github}\nLinkedIn: ${profile.linkedin}`);

  return sections.join("\n\n");
}
