export type ResourceLevel = "beginner" | "intermediate" | "advanced" | "all";
export type ResourceStatus = "draft" | "published";

export type Resource = {
  id: string;
  slug: string;
  title: string;
  kind: string;
  summary: string;
  body: string | null;
  level: ResourceLevel;
  topics: string[];
  href: string | null;
  cover_image: string | null;
  status: ResourceStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

/** Soft suggestions for the admin UI. Any custom kind string is allowed. */
export const suggestedResourceKinds = [
  "book",
  "cheatsheet",
  "hack",
  "guide",
  "video",
  "tool",
  "template",
  "course",
  "checklist",
] as const;

export function formatKindLabel(kind: string) {
  const trimmed = kind.trim();
  if (!trimmed) return "Resources";
  return trimmed
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function groupResourcesByKind(items: Resource[]) {
  const order: string[] = [];
  const map = new Map<string, Resource[]>();

  for (const item of items) {
    const key = item.kind.trim() || "other";
    if (!map.has(key)) {
      map.set(key, []);
      order.push(key);
    }
    map.get(key)!.push(item);
  }

  return order.map((kind) => ({
    kind,
    label: formatKindLabel(kind),
    items: map.get(kind)!,
  }));
}
