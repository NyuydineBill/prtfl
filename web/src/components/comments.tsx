"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Comment } from "@/lib/comments";

export function Comments({ postId, initialComments }: { postId: string; initialComments: Comment[] }) {
  const [comments] = useState(initialComments);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !name.trim() || !body.trim()) return;
    setSubmitting(true);
    setError(null);

    const { error: submitError } = await supabase
      .from("comments")
      .insert({ post_id: postId, name: name.trim(), body: body.trim() });

    setSubmitting(false);

    if (submitError) {
      setError(submitError.message);
      return;
    }

    setName("");
    setBody("");
    setSubmitted(true);
  }

  return (
    <div>
      <h2 className="font-mono text-xs uppercase tracking-wider text-accent">
        Comments {comments.length > 0 && `(${comments.length})`}
      </h2>

      <div className="mt-4 flex flex-col gap-4">
        {comments.length === 0 && (
          <p className="text-sm text-muted">No comments yet — be the first.</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-medium text-foreground">{c.name}</span>
              <span className="font-mono text-xs text-muted">
                {new Date(c.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{c.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t border-border pt-6">
        {submitted ? (
          <p className="text-sm text-muted">
            Thanks — your comment is in and will show up once it&rsquo;s reviewed.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              className="rounded-md border border-border bg-surface px-3 py-2.5 text-base text-foreground outline-none focus:border-accent"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Add a comment…"
              rows={3}
              required
              className="rounded-md border border-border bg-surface px-3 py-2.5 text-base text-foreground outline-none focus:border-accent"
            />
            <button
              type="submit"
              disabled={submitting}
              className="self-start rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Posting…" : "Post comment"}
            </button>
            {error && <p className="text-sm text-red-400">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
