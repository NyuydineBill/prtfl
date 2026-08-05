"use client";

import { useState } from "react";
import type { Comment } from "@/lib/comments";

function CommentThread({
  comments,
  parentId,
  onReply,
  depth = 0,
}: {
  comments: Comment[];
  parentId: string | null;
  onReply: (comment: Comment) => void;
  depth?: number;
}) {
  const commentIds = new Set(comments.map((comment) => comment.id));
  const children = comments.filter((comment) =>
    parentId === null
      ? !comment.parent_id || !commentIds.has(comment.parent_id)
      : comment.parent_id === parentId,
  );

  if (children.length === 0) return null;

  return (
    <div className={depth > 0 ? "ml-4 border-l border-border pl-4 sm:ml-6 sm:pl-5" : ""}>
      {children.map((comment) => (
        <div key={comment.id} className={depth > 0 ? "mt-3" : "mb-4"}>
          <article className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-medium text-foreground">{comment.name}</span>
              <time
                dateTime={comment.created_at}
                className="font-mono text-xs text-muted"
              >
                {new Date(comment.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </time>
            </div>
            <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-muted">
              {comment.body}
            </p>
            <button
              type="button"
              onClick={() => onReply(comment)}
              className="mt-3 text-xs font-medium text-accent hover:underline"
            >
              Reply
            </button>
          </article>
          <CommentThread
            comments={comments}
            parentId={comment.id}
            onReply={onReply}
            depth={depth + 1}
          />
        </div>
      ))}
    </div>
  );
}

export function Comments({ postId, initialComments }: { postId: string; initialComments: Comment[] }) {
  const [comments, setComments] = useState(initialComments);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [website, setWebsite] = useState("");
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !body.trim()) return;
    setSubmitting(true);
    setError(null);
    setMessage(null);

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postId,
        parentId: replyTo?.id ?? null,
        name: name.trim(),
        body: body.trim(),
        website,
      }),
    });

    setSubmitting(false);

    const resBody = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(resBody.error ?? "Something went wrong");
      return;
    }

    if (resBody.comment) {
      setComments((current) => [...current, resBody.comment as Comment]);
    }
    setBody("");
    setWebsite("");
    setReplyTo(null);
    setMessage("Your comment is now live.");
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
        <CommentThread comments={comments} parentId={null} onReply={setReplyTo} />
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <h3 className="text-sm font-medium text-foreground">
          {replyTo ? `Reply to ${replyTo.name}` : "Join the discussion"}
        </h3>
        {replyTo && (
          <div className="mt-2 flex items-center justify-between gap-3 rounded-md border border-border bg-surface px-3 py-2">
            <p className="truncate text-xs text-muted">
              Replying to “{replyTo.body}”
            </p>
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              className="shrink-0 text-xs text-accent hover:underline"
            >
              Cancel
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="mt-3 flex max-w-xl flex-col gap-3">
          <label htmlFor="comment-name" className="sr-only">
            Your name
          </label>
          <input
            id="comment-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoComplete="name"
            maxLength={80}
            required
            className="rounded-md border border-border bg-surface px-3 py-2.5 text-base text-foreground outline-none focus:border-accent"
          />
          <label htmlFor="comment-body" className="sr-only">
            Comment
          </label>
          <textarea
            id="comment-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={replyTo ? `Reply to ${replyTo.name}…` : "Add a comment…"}
            rows={3}
            maxLength={2_000}
            required
            className="rounded-md border border-border bg-surface px-3 py-2.5 text-base text-foreground outline-none focus:border-accent"
          />
          <div className="absolute -left-[10000px]" aria-hidden="true">
            <label htmlFor="comment-website">Website</label>
            <input
              id="comment-website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              autoComplete="off"
              tabIndex={-1}
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Posting…" : replyTo ? "Post reply" : "Post comment"}
            </button>
            <span className="text-xs text-muted">{body.length}/2000</span>
          </div>
          {message && (
            <p role="status" className="text-sm text-positive">
              {message}
            </p>
          )}
          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
