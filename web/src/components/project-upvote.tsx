"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { addReaction, fetchReactionCounts, hasReacted, markReacted } from "@/lib/reactions";

const EMOJI = "⭐";

export function ProjectUpvote({ slug, className = "" }: { slug: string; className?: string }) {
  const [count, setCount] = useState<number | null>(null);
  const [upvoted, setUpvoted] = useState(false);

  useEffect(() => {
    fetchReactionCounts("project", slug).then((counts) => {
      setCount(counts[EMOJI] ?? 0);
      setUpvoted(hasReacted("project", slug, EMOJI));
    });
  }, [slug]);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (upvoted) return;
    setCount((prev) => (prev ?? 0) + 1);
    setUpvoted(true);
    markReacted("project", slug, EMOJI);
    await addReaction("project", slug, EMOJI);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={upvoted}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors ${
        upvoted
          ? "border-gold/50 bg-gold/10 text-gold"
          : "border-border text-muted hover:border-gold/50 hover:text-gold"
      } ${className}`}
    >
      <Star className="h-3 w-3" fill={upvoted ? "currentColor" : "none"} />
      <span className="font-mono">{count ?? "···"}</span>
    </button>
  );
}
