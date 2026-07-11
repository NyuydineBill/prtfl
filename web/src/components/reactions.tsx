"use client";

import { useEffect, useState } from "react";
import { addReaction, fetchReactionCounts, hasReacted, markReacted } from "@/lib/reactions";

const EMOJIS = ["👍", "💡", "🔥"];

export function Reactions({ targetId }: { targetId: string }) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [reacted, setReacted] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchReactionCounts("post", targetId).then((counts) => {
      setCounts(counts);
      setReacted(new Set(EMOJIS.filter((e) => hasReacted("post", targetId, e))));
    });
  }, [targetId]);

  async function handleClick(emoji: string) {
    if (reacted.has(emoji)) return;
    setCounts((prev) => ({ ...prev, [emoji]: (prev[emoji] ?? 0) + 1 }));
    setReacted((prev) => new Set(prev).add(emoji));
    markReacted("post", targetId, emoji);
    await addReaction("post", targetId, emoji);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => handleClick(emoji)}
          disabled={reacted.has(emoji)}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
            reacted.has(emoji)
              ? "border-accent/50 bg-accent/10 text-accent"
              : "border-border text-muted hover:border-accent/50 hover:text-accent"
          }`}
        >
          <span>{emoji}</span>
          <span className="font-mono text-xs">{counts[emoji] ?? 0}</span>
        </button>
      ))}
    </div>
  );
}
