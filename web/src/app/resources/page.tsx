import Link from "next/link";
import { resources, resourceKinds, type Resource } from "@/lib/data/resources";
import { SectionHeading, Chip, Eyebrow } from "@/components/ui";
import { Reveal, RevealGroup, RevealItem } from "@/components/reveal";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Resources",
  description:
    "Books, cheatsheets, hacks, and practical guides for software architecture, AI systems, DevOps, and product engineering.",
  path: "/resources",
});

const kindLabel: Record<Resource["kind"], string> = {
  book: "Books",
  cheatsheet: "Cheatsheets",
  hack: "Hacks",
  guide: "Guides",
};

export default function ResourcesPage() {
  return (
    <div>
      <Reveal>
        <SectionHeading
          as="h1"
          index={1}
          eyebrow="Library"
          title="Resources"
          description="Books, cheatsheets, hacks, and guides I am collecting for engineers who want leverage. New material lands here as I publish it."
        />
      </Reveal>

      <Reveal className="mb-8" delay={0.04}>
        <p className="max-w-2xl text-sm text-muted">
          Want article-length deep dives meanwhile?{" "}
          <Link href="/articles" className="text-accent hover:underline">
            Browse articles
          </Link>{" "}
          or{" "}
          <Link href="/feed.xml" className="text-accent hover:underline">
            subscribe via RSS
          </Link>
          .
        </p>
      </Reveal>

      <div className="flex flex-col gap-12">
        {resourceKinds.map((kind) => {
          const items = resources.filter((resource) => resource.kind === kind);
          if (items.length === 0) return null;
          return (
            <section key={kind}>
              <Eyebrow>{kindLabel[kind]}</Eyebrow>
              <RevealGroup className="mt-4 grid gap-4 sm:grid-cols-2" stagger={0.05}>
                {items.map((resource) => (
                  <RevealItem key={resource.slug}>
                    <article className="h-full rounded-lg border border-border bg-surface p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Chip>{resource.level}</Chip>
                        <Chip>
                          {resource.status === "live" ? "Available" : "Coming soon"}
                        </Chip>
                      </div>
                      <h2 className="mt-3 text-lg font-medium text-foreground">{resource.title}</h2>
                      <p className="mt-2 text-sm leading-relaxed text-muted">{resource.summary}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {resource.topics.map((topic) => (
                          <span
                            key={topic}
                            className="rounded-md border border-border px-2 py-0.5 font-mono text-xs text-muted"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                      {resource.href && resource.status === "live" && (
                        <Link
                          href={resource.href}
                          className="mt-4 inline-block text-sm text-accent hover:underline"
                        >
                          Open resource →
                        </Link>
                      )}
                    </article>
                  </RevealItem>
                ))}
              </RevealGroup>
            </section>
          );
        })}
      </div>
    </div>
  );
}
