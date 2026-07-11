import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, Globe, Smartphone, GitBranch, type LucideIcon } from "lucide-react";
import { experience } from "@/lib/data/experience";
import { profile } from "@/lib/data/profile";
import { SectionHeading } from "@/components/ui";
import { Timeline, TimelineItem } from "@/components/timeline";
import { Reveal } from "@/components/reveal";

const iconFor: Record<string, LucideIcon> = {
  "Various US Clients": Globe,
  LandlordNde24: Smartphone,
  "Daytona & Outreachy (Fedora)": GitBranch,
};

export const metadata: Metadata = { title: "Experience · Nyuydine Bill Leynyuy" };

export default function ExperiencePage() {
  return (
    <div>
      <SectionHeading
        index={1}
        eyebrow="Work history"
        title="Experience"
        description="A chronological record of roles, projects, and production systems I've worked on."
      />

      <Timeline>
        {experience.map((entry, index) => {
          const Icon = iconFor[entry.org] ?? Briefcase;
          return (
            <TimelineItem key={`${entry.org}-${entry.period}`} icon={Icon} delay={index * 0.05}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-medium text-foreground">
                  {entry.role} · {entry.org}
                </h3>
                <span className="font-mono text-xs text-muted">{entry.period}</span>
              </div>
              <p className="text-sm text-muted">{entry.location}</p>
              {entry.summary && (
                <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted">
                  {entry.summary}
                </p>
              )}
              <ul className="mt-3 flex max-w-2xl flex-col gap-2">
                {entry.highlights.map((point) => (
                  <li key={point} className="text-base leading-relaxed text-muted">
                    <span className="mr-2 text-accent">›</span>
                    {point}
                  </li>
                ))}
              </ul>
            </TimelineItem>
          );
        })}
      </Timeline>

      <Reveal className="mt-16" delay={0.1}>
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-surface p-6">
          <div>
            <h2 className="font-mono text-xs uppercase tracking-wider text-accent">
              Beyond the code
            </h2>
            <p className="mt-2 max-w-md text-base text-muted">
              Teaching, mentoring, community leadership, and certifications live on their own page.
            </p>
          </div>
          <Link
            href="/community"
            className="shrink-0 rounded-md border border-border px-4 py-2 text-sm text-foreground hover:border-accent hover:text-accent"
          >
            View community & teaching →
          </Link>
        </div>
      </Reveal>

      <Reveal className="mt-10" delay={0.15}>
        <h2 className="font-mono text-xs uppercase tracking-wider text-accent">Education</h2>
        <div className="mt-4 flex flex-col gap-3">
          {profile.education.map((item) => (
            <div
              key={item.credential}
              className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-3"
            >
              <div>
                <p className="text-sm text-foreground">{item.credential}</p>
                <p className="text-sm text-muted">{item.institution}</p>
              </div>
              <span className="font-mono text-xs text-muted">{item.period}</span>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
