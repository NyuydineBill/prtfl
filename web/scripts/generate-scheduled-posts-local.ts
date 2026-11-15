#!/usr/bin/env npx tsx
/**
 * Insert locally authored articles + SVG covers as staggered scheduled posts.
 * No OpenAI calls.
 *
 * Usage:
 *   npx tsx scripts/generate-scheduled-posts-local.ts
 *   npx tsx scripts/generate-scheduled-posts-local.ts --per-day=1 --start=tomorrow
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { generateSvgCover } from "../src/lib/covers/generate-svg-cover";
import { slugify } from "../src/lib/posts";
import { localBatch01 } from "./local-articles/batch-01";
import { localBatch02 } from "./local-articles/batch-02";
import { localBatch03 } from "./local-articles/batch-03";
import { localBatch04 } from "./local-articles/batch-04";
import { localBatch05 } from "./local-articles/batch-05";

const batches = {
  "01": localBatch01,
  "02": localBatch02,
  "03": localBatch03,
  "04": localBatch04,
  "05": localBatch05,
} as const;

function loadEnv() {
  const path = resolve(process.cwd(), ".env.local");
  const raw = readFileSync(path, "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

function arg(name: string, fallback?: string) {
  const hit = process.argv.find((item) => item.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
}

function startDate(value: string) {
  if (value === "tomorrow") {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    return d;
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw new Error(`Invalid --start=${value}`);
  if (!value.includes("T")) d.setHours(9, 0, 0, 0);
  return d;
}

async function uniqueSlug(
  admin: ReturnType<typeof createClient>,
  title: string,
) {
  const base = slugify(title);
  for (let i = 0; i < 8; i += 1) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    const { data } = await admin.from("posts").select("id").eq("slug", candidate).maybeSingle();
    if (!data) return candidate;
  }
  return `${base}-${Date.now()}`;
}

async function main() {
  loadEnv();

  const perDay = Number(arg("per-day", "1"));
  const start = startDate(arg("start", "tomorrow")!);
  const batchId = (arg("batch", "01") ?? "01") as keyof typeof batches;
  const articles = batches[batchId];
  if (!articles) {
    throw new Error(`Unknown --batch=${batchId}. Use ${Object.keys(batches).join(", ")}`);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log(`Inserting batch ${batchId}: ${articles.length} local scheduled posts (no OpenAI)`);
  console.log(`First goes live: ${start.toISOString()}`);
  console.log(`Cadence: ${perDay} per day`);

  for (const [index, article] of articles.entries()) {
    const publishAt = new Date(start);
    publishAt.setDate(start.getDate() + Math.floor(index / Math.max(perDay, 1)));

    console.log(`\n[${index + 1}/${articles.length}] ${article.topicId} → ${publishAt.toISOString()}`);

    const slug = await uniqueSlug(admin, article.title);
    const svg = generateSvgCover({
      title: article.title,
      cluster: article.cluster,
      seed: article.topicId,
    });
    const path = `covers/${crypto.randomUUID()}.svg`;
    const { error: uploadError } = await admin.storage.from("post-images").upload(path, svg, {
      contentType: "image/svg+xml",
      upsert: false,
    });
    if (uploadError) throw new Error(uploadError.message);
    const coverImage = admin.storage.from("post-images").getPublicUrl(path).data.publicUrl;

    const { data: post, error } = await admin
      .from("posts")
      .insert({
        title: article.title,
        slug,
        excerpt: article.excerpt,
        content: article.content,
        cover_image: coverImage,
        tags: article.tags,
        status: "published",
        ai_generated: false,
        published_at: publishAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id, slug, published_at")
      .single();

    if (error || !post) throw new Error(error?.message ?? "Insert failed");
    console.log(`  saved /articles/${post.slug}`);
  }

  console.log("\nDone. Posts are scheduled and will appear on their publish dates.");
  console.log("Run supabase/posts-scheduling.sql in Supabase so RLS also hides future posts.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
