#!/usr/bin/env npx tsx
/**
 * Generate curated articles + cover images and insert them as scheduled posts.
 *
 * Usage:
 *   npx tsx scripts/generate-scheduled-posts.ts --count=10 --per-day=1 --start=tomorrow
 *   npx tsx scripts/generate-scheduled-posts.ts --count=5 --per-day=1 --start=2026-11-16 --offset=0
 *
 * Posts are status=published with future published_at, so they go live automatically
 * when that timestamp arrives (public queries filter published_at <= now()).
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { articleTopics } from "../src/lib/data/article-topics";
import { profile } from "../src/lib/data/profile";
import { slugify } from "../src/lib/posts";

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

  const count = Number(arg("count", "10"));
  const perDay = Number(arg("per-day", "1"));
  const offset = Number(arg("offset", "0"));
  const withImages = arg("images", "true") !== "false";
  const start = startDate(arg("start", "tomorrow")!);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!url || !serviceKey || !openaiKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or OPENAI_API_KEY");
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const openai = new OpenAI({ apiKey: openaiKey });
  const topics = articleTopics.slice(offset, offset + count);

  console.log(`Generating ${topics.length} scheduled posts`);
  console.log(`First goes live: ${start.toISOString()}`);
  console.log(`Cadence: ${perDay} per day`);
  console.log(`Images: ${withImages ? "yes" : "no"}`);

  const systemPrompt = `You are drafting a blog post for ${profile.name}'s personal engineering blog, written in first person as ${profile.name}.

Background, for voice and grounding only, do not repeat this verbatim: ${profile.summary}

Rules:
- Write in first person, as ${profile.name} would write it himself.
- Do not invent specific metrics, client names, employers, or achievements beyond what the topic itself implies. When unsure, keep claims general rather than fabricating specifics.
- Direct, technical tone. No marketing language, no filler, no generic AI-sounding phrasing.
- Never use em dashes (—) or en dashes (–) as punctuation. Use a period, comma, colon, or parentheses instead.
- Vary structure. Teach one useful idea.
- content is Markdown. excerpt is one plain sentence.
- Aim for roughly 800 to 1400 words unless naturally a short cheatsheet.`;

  let dayIndex = 0;
  for (const [index, topic] of topics.entries()) {
    const publishAt = new Date(start);
    publishAt.setDate(start.getDate() + Math.floor(dayIndex));
    if ((index + 1) % perDay === 0) dayIndex += 1;

    console.log(`\n[${index + 1}/${topics.length}] ${topic.id} → ${publishAt.toISOString()}`);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 4000,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Write a blog post about: ${topic.title}. Angle: ${topic.angle}. Write a useful engineering article, not a keyword dump.`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "blog_post_draft",
          strict: true,
          schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              excerpt: { type: "string" },
              content: { type: "string" },
            },
            required: ["title", "excerpt", "content"],
            additionalProperties: false,
          },
        },
      },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error("No content returned");
    const draft = JSON.parse(raw) as { title: string; excerpt: string; content: string };
    const slug = await uniqueSlug(admin, draft.title);

    let coverImage: string | null = null;
    if (withImages) {
      console.log("  generating cover image…");
      const image = await openai.images.generate({
        model: "dall-e-3",
        prompt: `${topic.imagePrompt}. Wide 16:9 editorial illustration, no logos, no watermarks, no readable text characters.`,
        size: "1792x1024",
        quality: "standard",
        n: 1,
      });
      const remoteUrl = image.data?.[0]?.url;
      if (!remoteUrl) throw new Error("No image URL");
      const downloaded = await fetch(remoteUrl);
      const bytes = Buffer.from(await downloaded.arrayBuffer());
      const path = `covers/${crypto.randomUUID()}.png`;
      const { error: uploadError } = await admin.storage.from("post-images").upload(path, bytes, {
        contentType: "image/png",
        upsert: false,
      });
      if (uploadError) throw new Error(uploadError.message);
      coverImage = admin.storage.from("post-images").getPublicUrl(path).data.publicUrl;
    }

    const { data: post, error } = await admin
      .from("posts")
      .insert({
        title: draft.title,
        slug,
        excerpt: draft.excerpt,
        content: draft.content,
        cover_image: coverImage,
        tags: topic.tags,
        status: "published",
        ai_generated: true,
        published_at: publishAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id, slug, published_at")
      .single();

    if (error || !post) throw new Error(error?.message ?? "Insert failed");
    console.log(`  saved /articles/${post.slug}`);
  }

  console.log("\nDone. Posts are scheduled and will appear automatically on their publish dates.");
  console.log("Run supabase/posts-scheduling.sql in Supabase so RLS also hides future posts.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
