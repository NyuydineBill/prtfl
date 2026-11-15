#!/usr/bin/env npx tsx
/**
 * Replace SVG/text covers with curated Unsplash photography (stored in Supabase).
 *
 *   npx tsx scripts/refresh-covers.ts
 *   npx tsx scripts/refresh-covers.ts --only-svg=true
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { pickCoverPhotoUrl } from "../src/lib/covers/cover-photos";

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

async function main() {
  loadEnv();
  const onlySvg = arg("only-svg", "true") !== "false";
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error("Missing Supabase env");

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: posts, error } = await admin
    .from("posts")
    .select("id, slug, title, tags, cover_image")
    .order("published_at", { ascending: true });
  if (error) throw error;

  const targets = (posts ?? []).filter((post) => {
    if (!onlySvg) return true;
    const cover = post.cover_image ?? "";
    return cover.endsWith(".svg") || cover.includes("image/svg") || !cover;
  });

  console.log(`Refreshing ${targets.length} covers (onlySvg=${onlySvg})`);

  for (const [index, post] of targets.entries()) {
    const photoUrl = pickCoverPhotoUrl({
      seed: post.slug || post.id,
      tags: post.tags,
    });
    console.log(`[${index + 1}/${targets.length}] ${post.slug}`);
    console.log(`  ← ${photoUrl}`);

    try {
      const res = await fetch(photoUrl, {
        headers: { "User-Agent": "prtfl-cover-refresh/1.0" },
      });
      if (!res.ok) throw new Error(`Download failed ${res.status} for ${photoUrl}`);
      const bytes = Buffer.from(await res.arrayBuffer());
      const contentType = res.headers.get("content-type") || "image/jpeg";
      const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
      const path = `covers/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await admin.storage.from("post-images").upload(path, bytes, {
        contentType,
        upsert: false,
      });
      if (uploadError) throw new Error(uploadError.message);

      const publicUrl = admin.storage.from("post-images").getPublicUrl(path).data.publicUrl;
      const { error: updateError } = await admin
        .from("posts")
        .update({ cover_image: publicUrl, updated_at: new Date().toISOString() })
        .eq("id", post.id);
      if (updateError) throw new Error(updateError.message);
      console.log(`  → ${publicUrl}`);
    } catch (err) {
      console.error(`  ! ${err instanceof Error ? err.message : err}`);
    }
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
