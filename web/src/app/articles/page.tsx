import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import type { Post } from "@/lib/posts";
import { SectionHeading, Chip } from "@/components/ui";
import { Reveal, RevealGroup, RevealItem } from "@/components/reveal";
import { SubscribeForm } from "@/components/subscribe-form";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Articles",
  description: "Notes on software architecture, AI systems, and building production software.",
  path: "/articles",
});

export default async function ArticlesPage() {
  const supabase = await createClient();
  const { data: posts } = supabase
    ? await supabase
        .from("posts")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false })
    : { data: null as Post[] | null };

  return (
    <div>
      <Reveal>
        <SectionHeading
          as="h1"
          index={1}
          eyebrow="Writing"
          title="Articles"
          description="Notes on software architecture, AI systems, and building production software."
        />
      </Reveal>

      <Reveal className="mb-8 sm:mb-12" delay={0.05}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SubscribeForm />
          <Link href="/feed.xml" className="text-sm text-accent hover:underline">
            RSS feed →
          </Link>
        </div>
      </Reveal>

      {!posts || posts.length === 0 ? (
        <p className="text-base text-muted">No articles published yet. Check back soon.</p>
      ) : (
        <RevealGroup className="flex flex-col gap-4" stagger={0.06}>
          {posts.map((post: Post) => (
            <RevealItem key={post.id}>
              <Link
                href={`/articles/${post.slug}`}
                className="group block overflow-hidden rounded-lg border border-border bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-accent/60"
              >
                {post.cover_image && (
                  <div className="relative aspect-[21/9] w-full">
                    <Image
                      src={post.cover_image}
                      alt={`Cover image for ${post.title}`}
                      fill
                      sizes="(min-width: 768px) 720px, 100vw"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <span className="font-mono text-xs text-muted">
                    {post.published_at &&
                      new Date(post.published_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                  </span>
                  <h2 className="mt-2 text-xl font-medium text-foreground group-hover:text-accent">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="mt-2 text-base leading-relaxed text-muted">{post.excerpt}</p>
                  )}
                  {post.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <Chip key={tag}>{tag}</Chip>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      )}
    </div>
  );
}
