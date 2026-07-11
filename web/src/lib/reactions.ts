import { supabase } from "@/lib/supabase/client";

export type ReactionTarget = "post" | "project";

export async function fetchReactionCounts(
  targetType: ReactionTarget,
  targetId: string
): Promise<Record<string, number>> {
  if (!supabase) return {};
  const { data } = await supabase
    .from("reactions")
    .select("emoji")
    .eq("target_type", targetType)
    .eq("target_id", targetId);

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    counts[row.emoji] = (counts[row.emoji] ?? 0) + 1;
  }
  return counts;
}

export async function addReaction(
  targetType: ReactionTarget,
  targetId: string,
  emoji: string
) {
  if (!supabase) return;
  await supabase.from("reactions").insert({ target_type: targetType, target_id: targetId, emoji });
}

export function hasReacted(targetType: ReactionTarget, targetId: string, emoji: string) {
  if (typeof window === "undefined") return false;
  const key = `reacted:${targetType}:${targetId}`;
  const stored = window.localStorage.getItem(key);
  return stored ? stored.split(",").includes(emoji) : false;
}

export function markReacted(targetType: ReactionTarget, targetId: string, emoji: string) {
  if (typeof window === "undefined") return;
  const key = `reacted:${targetType}:${targetId}`;
  const stored = window.localStorage.getItem(key);
  const set = new Set(stored ? stored.split(",") : []);
  set.add(emoji);
  window.localStorage.setItem(key, Array.from(set).join(","));
}
