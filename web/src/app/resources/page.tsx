import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { groupResourcesByKind, type Resource } from "@/lib/resources";
import { SectionHeading, Chip, Eyebrow } from "@/components/ui";
import { Reveal, RevealGroup, RevealItem } from "@/components/reveal";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Resources",
  description:
    "Books, cheatsheets, tools, videos, and practical guides for software architecture, AI systems, DevOps, and product engineering.",
  path: "/resources",
});

export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  const supabase = await createClient();
  const { data } = supabase
    ? await supabase
        .from("resources")
        .select("*")
        .eq("status", "published")
        .order("sort_order", { ascending: true })
        .order("title", { ascending: true })
    : { data: null as Resource[] | null };

  const resources = (data as Resource[] | null) ?? [];
  const groups = groupResourcesByKind(resources);

  return (
    <div>
      <Reveal>
        <SectionHeading
          as="h1"
          index={1}
          eyebrow="Library"
          title="Resources"
          description="Books, cheatsheets, tools, videos, and guides collected for engineers who want leverage. New material lands here as I publish it."
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

      {groups.length === 0 ? (
        <p className="text-base text-muted">Resources will appear here as they are published.</p>
      ) : (
        <div className="flex flex-col gap-12">
          {groups.map((group) => (
            <section key={group.kind}>
              <Eyebrow>{group.label}</Eyebrow>
              <RevealGroup className="mt-4 grid gap-4 sm:grid-cols-2" stagger={0.05}>
                {group.items.map((resource) => {
                  const internalHref =
                    resource.body && !resource.href ? `/resources/${resource.slug}` : null;
                  const actionHref = resource.href || internalHref;

                  return (
                    <RevealItem key={resource.id}>
                      <article className="h-full rounded-lg border border-border bg-surface p-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <Chip>{resource.level === "all" ? "All levels" : resource.level}</Chip>
                        </div>
                        <h2 className="mt-3 text-lg font-medium text-foreground">
                          {resource.title}
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed text-muted">
                          {resource.summary}
                        </p>
                        {resource.topics.length > 0 && (
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
                        )}
                        {actionHref && (
                          <Link
                            href={actionHref}
                            {...(resource.href
                              ? { target: "_blank", rel: "noopener noreferrer" }
                              : {})}
                            className="mt-4 inline-block text-sm text-accent hover:underline"
                          >
                            {resource.href ? "Open resource" : "Read more"}
                          </Link>
                        )}
                      </article>
                    </RevealItem>
                  );
                })}
              </RevealGroup>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
