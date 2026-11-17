import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createClient } from "@/lib/supabase/server";
import { formatKindLabel, type Resource } from "@/lib/resources";
import { Chip, Eyebrow } from "@/components/ui";
import { defaultDescription, pageMetadata } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  if (!supabase) return {};
  const { data } = await supabase
    .from("resources")
    .select("title, summary")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (!data) return {};
  return pageMetadata({
    title: data.title,
    description: data.summary || defaultDescription,
    path: `/resources/${slug}`,
  });
}

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  if (!supabase) notFound();

  const { data } = await supabase
    .from("resources")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!data) notFound();
  const resource = data as Resource;
  if (!resource.body && resource.href) {
    // Prefer external destination when there is no body.
    notFound();
  }
  if (!resource.body) notFound();

  return (
    <article className="mx-auto max-w-3xl">
      <Link href="/resources" className="text-sm text-muted hover:text-accent">
        ← Resources
      </Link>
      <div className="mt-6">
        <Eyebrow>{formatKindLabel(resource.kind)}</Eyebrow>
      </div>
      <h1 className="mt-3 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
        {resource.title}
      </h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <Chip>{resource.level === "all" ? "All levels" : resource.level}</Chip>
        {resource.topics.map((topic) => (
          <Chip key={topic}>{topic}</Chip>
        ))}
      </div>
      {resource.summary && (
        <p className="mt-6 text-lg leading-relaxed text-muted">{resource.summary}</p>
      )}
      <div className="prose-article mt-10">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{resource.body}</ReactMarkdown>
      </div>
      {resource.href && (
        <p className="mt-10">
          <a
            href={resource.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            Open linked resource
          </a>
        </p>
      )}
    </article>
  );
}
