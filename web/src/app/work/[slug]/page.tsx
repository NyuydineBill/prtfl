import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { projects } from "@/lib/data/projects";
import { Chip, Eyebrow } from "@/components/ui";
import { Reveal, RevealGroup, RevealItem } from "@/components/reveal";
import { ProjectFlowDiagram } from "@/components/project-diagram";
import { ProjectVisualPlaceholder } from "@/components/project-visual-placeholder";
import { GithubIcon } from "@/components/brand-icons";
import { ProjectUpvote } from "@/components/project-upvote";
import { ExternalLink, Package } from "lucide-react";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return { title: "Project" };

  return {
    title: project.name,
    description: project.summary,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      type: "article",
      title: project.name,
      description: project.summary,
      url: `/work/${project.slug}`,
      images: project.screenshot ? [{ url: project.screenshot }] : undefined,
    },
    twitter: {
      card: project.screenshot ? "summary_large_image" : "summary",
      title: project.name,
      description: project.summary,
      images: project.screenshot ? [project.screenshot] : undefined,
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  return (
    <div>
      <Link href="/work" className="text-sm text-muted hover:text-accent">
        ← Work
      </Link>

      <Reveal>
        <div className="mt-6">
          <Eyebrow>{project.category}</Eyebrow>
          <h1 className="mt-2 text-3xl font-semibold text-foreground sm:text-4xl">
            {project.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted">
            <span>{project.role}</span>
            <span className="text-border">·</span>
            <span>{project.period}</span>
            <span className="rounded-md border border-border px-2 py-0.5 font-mono text-xs text-muted">
              {project.status}
            </span>
            <ProjectUpvote slug={project.slug} />
          </div>
        </div>

        {project.links && project.links.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-3">
            {project.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm text-foreground hover:border-accent hover:text-accent"
              >
                {link.kind === "github" ? (
                  <GithubIcon className="h-3.5 w-3.5" />
                ) : link.kind === "package" ? (
                  <Package className="h-3.5 w-3.5" />
                ) : (
                  <ExternalLink className="h-3.5 w-3.5" />
                )}
                {link.label}
              </a>
            ))}
          </div>
        )}

        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted">
          {project.overview}
        </p>
      </Reveal>

      {(project.diagram || project.screenshot || project.hasVisual) && (
        <Reveal delay={0.05} className="mt-8">
          {project.diagram ? (
            <ProjectFlowDiagram steps={project.diagram} />
          ) : project.screenshot ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-surface">
              <Image
                src={project.screenshot}
                alt={`${project.name} screenshot`}
                fill
                sizes="(min-width: 768px) 720px, 100vw"
                className="object-cover object-top"
                priority
              />
            </div>
          ) : (
            <ProjectVisualPlaceholder name={project.name} />
          )}
        </Reveal>
      )}

      {(project.problem || project.solution) && (
        <RevealGroup className="mt-12 grid gap-4 sm:grid-cols-2" stagger={0.06}>
          {project.problem && (
            <RevealItem>
              <div className="h-full rounded-lg border border-border bg-surface p-5">
                <h2 className="font-mono text-xs uppercase tracking-wider text-muted">
                  Problem
                </h2>
                <p className="mt-3 text-base leading-relaxed text-muted">{project.problem}</p>
              </div>
            </RevealItem>
          )}
          {project.solution && (
            <RevealItem>
              <div className="h-full rounded-lg border border-accent/30 bg-surface p-5">
                <h2 className="font-mono text-xs uppercase tracking-wider text-accent">
                  Solution
                </h2>
                <p className="mt-3 text-base leading-relaxed text-muted">{project.solution}</p>
              </div>
            </RevealItem>
          )}
        </RevealGroup>
      )}

      <Reveal delay={0.05} className="mt-12">
        <h2 className="font-mono text-xs uppercase tracking-wider text-accent">Tech stack</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {project.stack.map((tech) => (
            <Chip key={tech}>{tech}</Chip>
          ))}
        </div>
      </Reveal>

      {project.keyFeatures && project.keyFeatures.length > 0 && (
        <Reveal delay={0.05} className="mt-12">
          <h2 className="font-mono text-xs uppercase tracking-wider text-accent">Key features</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {project.keyFeatures.map((feature) => (
              <li
                key={feature}
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-muted"
              >
                {feature}
              </li>
            ))}
          </ul>
        </Reveal>
      )}

      {project.engineeringHighlights && project.engineeringHighlights.length > 0 && (
        <Reveal delay={0.05} className="mt-12">
          <h2 className="font-mono text-xs uppercase tracking-wider text-accent">
            Engineering highlights
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {project.engineeringHighlights.map((item) => (
              <span
                key={item}
                className="rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-xs text-accent"
              >
                {item}
              </span>
            ))}
          </div>
        </Reveal>
      )}

      {project.highlights && project.highlights.length > 0 && (
        <div className="mt-12 max-w-2xl">
          <h2 className="font-mono text-xs uppercase tracking-wider text-accent">
            My contributions
          </h2>
          <RevealGroup className="mt-4 flex flex-col gap-4" stagger={0.06}>
            {project.highlights.map((point) => (
              <RevealItem key={point}>
                <p className="rounded-lg border border-border bg-surface p-4 text-sm leading-relaxed text-muted">
                  {point}
                </p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      )}

      {project.challenges && project.challenges.length > 0 && (
        <Reveal delay={0.05} className="mt-12 max-w-2xl">
          <h2 className="font-mono text-xs uppercase tracking-wider text-accent">
            Engineering challenges
          </h2>
          <ul className="mt-4 flex flex-col gap-2">
            {project.challenges.map((challenge) => (
              <li key={challenge} className="text-sm leading-relaxed text-muted">
                <span className="mr-2 text-accent">›</span>
                {challenge}
              </li>
            ))}
          </ul>
        </Reveal>
      )}

      {project.impact && (
        <Reveal delay={0.05} className="mt-12">
          <div className="rounded-lg border border-accent/30 bg-accent/5 p-6">
            <h2 className="font-mono text-xs uppercase tracking-wider text-accent">
              Impact
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-foreground">
              {project.impact}
            </p>
          </div>
        </Reveal>
      )}
    </div>
  );
}
