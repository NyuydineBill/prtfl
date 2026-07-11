import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createClient } from "@/lib/supabase/server";
import { Chip } from "@/components/ui";
import { Reveal } from "@/components/reveal";
import { Reactions } from "@/components/reactions";
import { Comments } from "@/components/comments";
import type { Comment } from "@/lib/comments";

export const dynamic = "force-dynamic";

async function getPost(slug: string) {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  return { title: post ? `${post.title} · Nyuydine Bill Leynyuy` : "Article" };
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
          <div className="relative mt-8 aspect-[21/9] w-full max-w-2xl overflow-hidden rounded-lg border border-border">
            <Image src={post.cover_image} alt="" fill className="object-cover" />
          </div>
        )}

        <div className="prose-article mt-10 max-w-2xl">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </div>

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
