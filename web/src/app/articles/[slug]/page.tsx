import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { Chip } from "@/components/ui";
import { Reveal } from "@/components/reveal";
import { Reactions } from "@/components/reactions";
import { Comments } from "@/components/comments";
import { ArticleContent, ArticleCoverImage } from "@/components/article-content";
import { JsonLd } from "@/components/json-ld";
import { articleSchema, breadcrumbSchema } from "@/lib/schema";
import { defaultOgImage, pageMetadata, siteName } from "@/lib/site";
import type { Comment } from "@/lib/comments";
import type { Post } from "@/lib/posts";

const getPost = cache(async (slug: string): Promise<Post | null> => {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return data;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) {
    return { title: "Article", robots: { index: false, follow: false } };
  }

  const description = post.excerpt ?? `Article by Nyuydine Bill Leynyuy: ${post.title}`;
  const image = post.cover_image ?? defaultOgImage.url;

  return {
    ...pageMetadata({
      title: post.title,
      description,
      path: `/articles/${post.slug}`,
      image: post.cover_image ?? undefined,
      type: "article",
    }),
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url: `/articles/${post.slug}`,
      siteName,
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at ?? undefined,
      tags: post.tags ?? undefined,
      images: post.cover_image
        ? [{ url: post.cover_image, alt: post.title }]
        : [defaultOgImage],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [image],
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const supabase = await createClient();
  const { data: comments } = supabase
    ? await supabase
        .from("comments")
        .select("*")
        .eq("post_id", post.id)
        .eq("status", "approved")
        .order("created_at", { ascending: true })
    : { data: null as Comment[] | null };

  return (
    <div>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Articles", path: "/articles" },
            { name: post.title, path: `/articles/${post.slug}` },
          ]),
          articleSchema(post),
        ]}
      />

      <Link href="/articles" className="text-sm text-muted hover:text-accent">
        ← Articles
      </Link>

      <Reveal className="mt-6">
        <span className="font-mono text-xs text-muted">
          {post.published_at &&
            new Date(post.published_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
        </span>
        <h1 className="mt-2 text-3xl font-semibold text-foreground sm:text-4xl">
          {post.title}
        </h1>
        {post.tags?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag: string) => (
              <Chip key={tag}>{tag}</Chip>
            ))}
          </div>
        )}

        {post.cover_image && (
          <ArticleCoverImage
            src={post.cover_image}
            alt={`Cover image for ${post.title}`}
          />
        )}

        <ArticleContent content={post.content} />

        <div className="mt-8">
          <Reactions targetId={post.id} />
        </div>

        <div className="mt-10 max-w-2xl sm:mt-16">
          <Comments postId={post.id} initialComments={comments ?? []} />
        </div>
      </Reveal>
    </div>
  );
}
