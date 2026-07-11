import Link from "next/link";
import type { Metadata } from "next";
import { projects } from "@/lib/data/projects";
import { Eyebrow, SectionHeading } from "@/components/ui";
import { Reveal, RevealGroup, RevealItem } from "@/components/reveal";
import { ProjectUpvote } from "@/components/project-upvote";

export const metadata: Metadata = { title: "Work · Nyuydine Bill Leynyuy" };

export default function WorkPage() {
  return (
    <div>
      <Reveal>
        <SectionHeading
          index={1}
          eyebrow="Selected work"
          title="Projects"
          description="Systems I've taken from architecture through to deployment. More case studies coming."
        />
      </Reveal>
      <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
        {projects.map((project) => (
          <RevealItem key={project.slug}>
            <Link
              href={`/work/${project.slug}`}
              className="group flex h-full flex-col rounded-lg border border-border bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 hover:shadow-[0_0_30px_-12px_var(--color-accent)]"
            >
              <Eyebrow>{project.category}</Eyebrow>
              <h2 className="mt-2 text-xl font-medium text-foreground group-hover:text-accent">
                {project.name}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {project.role} · {project.period} · {project.status}
              </p>
              <p className="mt-3 text-base leading-relaxed text-muted">
                {project.summary}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.stack.slice(0, 4).map((tech) => (
                  <span
                    key={tech}
                    className="rounded-md border border-border px-2 py-0.5 font-mono text-xs text-muted"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <div className="mt-4">
                <ProjectUpvote slug={project.slug} />
              </div>
            </Link>
          </RevealItem>
        ))}
      </RevealGroup>
    </div>
  );
}
