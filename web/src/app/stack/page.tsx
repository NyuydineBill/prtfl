import { skillGroups } from "@/lib/data/skills";
import { SectionHeading } from "@/components/ui";
import { Reveal, RevealGroup, RevealItem } from "@/components/reveal";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Stack",
  description:
    "Languages, frameworks, cloud infrastructure, and tools used across production systems: Python, TypeScript, Django, React, PostgreSQL, Docker, Azure, AWS, and more.",
  path: "/stack",
});

export default function StackPage() {
  return (
    <div>
      <Reveal>
        <SectionHeading
          as="h1"
          index={1}
          eyebrow="Technical stack"
          title="Tools I work with"
          description="The languages, frameworks, and infrastructure I use day to day across backend, frontend, mobile, AI, and cloud."
        />
      </Reveal>
      <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" stagger={0.05}>
        {skillGroups.map((group) => (
          <RevealItem key={group.category}>
            <div className="h-full rounded-lg border border-border bg-surface p-5 transition-all duration-300 hover:-translate-y-1 hover:border-accent/60">
              <h3 className="font-mono text-xs uppercase tracking-wider text-accent">
                {group.category}
              </h3>
              <ul className="mt-3 flex flex-col gap-1.5">
                {group.items.map((item) => (
                  <li key={item} className="text-base text-muted">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </div>
  );
}
