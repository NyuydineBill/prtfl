import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@/lib/supabase/server";
import type { Resource } from "@/lib/resources";
import pdfManifest from "./pdf-manifest.json";

export type PdfInfo = {
  file: string;
  pages: number;
  bytes: number;
  generatedAt: string;
};

export function getPdfInfo(slug: string): PdfInfo | null {
  return (pdfManifest as Record<string, PdfInfo>)[slug] ?? null;
}

/**
 * Local preview: with RESOURCES_LOCAL_PREVIEW=1 in development, the body comes from
 * scripts/local-resources/content/<slug>.md instead of Supabase. This lets you review a
 * rewrite (and build its PDF) before seeding it into the live database.
 */
async function localBody(slug: string) {
  if (process.env.NODE_ENV === "production" || process.env.RESOURCES_LOCAL_PREVIEW !== "1") {
    return null;
  }
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  try {
    const file = path.join(process.cwd(), "scripts", "local-resources", "content", `${slug}.md`);
    return (await readFile(file, "utf8")).trim();
  } catch {
    return null;
  }
}

export async function getPublishedResource(slug: string): Promise<Resource | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("resources")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (!data) return null;

  const resource = data as Resource;
  const preview = await localBody(slug);
  return preview ? { ...resource, body: preview } : resource;
}

export async function getPublishedSiblings(excludeSlug: string) {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("resources")
    .select("slug, title, summary, level, kind, sort_order, body, href")
    .eq("status", "published")
    .neq("slug", excludeSlug)
    .order("sort_order", { ascending: true });
  return ((data ?? []) as Pick<
    Resource,
    "slug" | "title" | "summary" | "level" | "kind" | "sort_order" | "body" | "href"
  >[]).filter((item) => item.body && !item.href);
}
