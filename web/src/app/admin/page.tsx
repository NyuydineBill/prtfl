import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Post } from "@/lib/posts";
import { SectionHeading } from "@/components/ui";

export const metadata: Metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: posts } = supabase
    ? await supabase.from("posts").select("*").order("created_at", { ascending: false })
    : { data: null as Post[] | null };

  return (
    <div>
      <SectionHeading eyebrow="Content management" title="Articles" />

      <Link
        href="/admin/posts/new"
        className="mb-8 inline-block rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-background hover:opacity-90"
      >
        New post
      </Link>

      <div className="flex flex-col gap-3">
        {posts?.length === 0 && (
          <p className="text-base text-muted">No posts yet.</p>
        )}
        {posts?.map((post) => (
          <Link
            key={post.id}
            href={`/admin/posts/${post.id}/edit`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4 hover:border-accent/60"
          >
            <div>
              <h2 className="font-medium text-foreground">{post.title}</h2>
              <p className="mt-1 text-sm text-muted">
                {new Date(post.updated_at).toLocaleDateString()}
                {post.ai_generated && " · AI draft"}
              </p>
            </div>
            <span
              className={`rounded-md border px-2.5 py-1 font-mono text-xs ${
                post.status === "published"
                  ? "border-positive/40 text-positive"
                  : "border-border text-muted"
              }`}
            >
              {post.status}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
