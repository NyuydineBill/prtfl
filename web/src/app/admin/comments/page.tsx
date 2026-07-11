"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { SectionHeading } from "@/components/ui";

type CommentRow = {
  id: string;
  name: string;
  body: string;
  status: "pending" | "approved";
  created_at: string;
  post: { title: string; slug: string } | null;
};

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<CommentRow[] | null>(null);

  async function load() {
    if (!supabase) return;
    const { data } = await supabase
      .from("comments")
      .select("id, name, body, status, created_at, post:posts(title, slug)")
      .order("created_at", { ascending: false });
    setComments((data as unknown as CommentRow[]) ?? []);
  }

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("comments")
      .select("id, name, body, status, created_at, post:posts(title, slug)")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setComments((data as unknown as CommentRow[]) ?? []);
      });
  }, []);

  async function approve(id: string) {
    if (!supabase) return;
    await supabase.from("comments").update({ status: "approved" }).eq("id", id);
    load();
  }

  async function remove(id: string) {
    if (!supabase) return;
    if (!confirm("Delete this comment?")) return;
    await supabase.from("comments").delete().eq("id", id);
    load();
  }

  return (
    <div>
      <SectionHeading eyebrow="Moderation" title="Comments" />
      <div className="flex flex-col gap-3">
        {comments?.length === 0 && <p className="text-base text-muted">No comments yet.</p>}
        {comments?.map((c) => (
          <div key={c.id} className="rounded-lg border border-border bg-surface p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-sm font-medium text-foreground">{c.name}</span>
              <div className="flex items-center gap-3">
                {c.post && (
                  <Link
                    href={`/articles/${c.post.slug}`}
                    target="_blank"
                    className="text-xs text-muted hover:text-accent"
                  >
                    {c.post.title}
                  </Link>
                )}
                <span
                  className={`rounded-md border px-2 py-0.5 font-mono text-xs ${
                    c.status === "approved"
                      ? "border-positive/40 text-positive"
                      : "border-border text-muted"
                  }`}
                >
                  {c.status}
                </span>
              </div>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">{c.body}</p>
            <div className="mt-3 flex gap-3 border-t border-border pt-3">
              {c.status === "pending" && (
                <button
                  type="button"
                  onClick={() => approve(c.id)}
                  className="text-sm text-accent hover:underline"
                >
                  Approve
                </button>
              )}
              <button
                type="button"
                onClick={() => remove(c.id)}
                className="text-sm text-red-400 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
