import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { profile } from "@/lib/data/profile";
import { getTopic } from "@/lib/data/article-topics";
import { uploadCoverPhoto } from "@/lib/covers/upload-cover-photo";
import { slugify } from "@/lib/posts";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      supabase: null,
      user: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { supabase, user, error: null };
}

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY is not configured" }, { status: 500 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    admin = await createClient();
  }

  const body = await request.json().catch(() => null);
  const topicId = typeof body?.topicId === "string" ? body.topicId : "";
  const topicText = typeof body?.topic === "string" ? body.topic.trim() : "";
  const generateImage = Boolean(body?.generateImage);
  const save = Boolean(body?.save);
  const publish = Boolean(body?.publish);
  const publishAtRaw = typeof body?.publishAt === "string" ? body.publishAt : "";
  const publishAt = publishAtRaw ? new Date(publishAtRaw) : null;
  if (publishAtRaw && (!publishAt || Number.isNaN(publishAt.getTime()))) {
    return NextResponse.json({ error: "Invalid publishAt datetime" }, { status: 400 });
  }

  const curated = topicId ? getTopic(topicId) : undefined;
  const topic = curated
    ? `${curated.title}. Angle: ${curated.angle}. Write a useful engineering article, not a keyword dump.`
    : topicText;

  if (!topic) {
    return NextResponse.json({ error: "Missing topic" }, { status: 400 });
  }

  const openai = new OpenAI({ apiKey });

  const systemPrompt = `You are drafting a blog post for ${profile.name}'s personal engineering blog, written in first person as ${profile.name}.

Background, for voice and grounding only, do not repeat this verbatim: ${profile.summary}

Rules:
- Write in first person, as ${profile.name} would write it himself.
- Do not invent specific metrics, client names, employers, or achievements beyond what the topic itself implies. When unsure, keep claims general rather than fabricating specifics.
- Direct, technical tone. No marketing language, no filler, no generic AI-sounding phrasing ("in today's fast-paced world", "let's dive in").
- Never use em dashes or en dashes as punctuation. Use a period, comma, colon, or parentheses instead.
- Vary the structure from post to post: don't default to the same intro-body-conclusion template every time. Mix up how it opens (a claim, a concrete scenario, a question worth answering), vary paragraph and sentence length, and only add headings or lists where they genuinely earn their place, not as a reflex.
- Write like a person thinking out loud on a topic they know well, not like a structured report. Uneven rhythm, the occasional short blunt sentence, real opinions, ok.
- Be useful. Teach one clear idea with concrete reasoning a working engineer can apply.
- "content" is valid Markdown: use headings, code blocks, and lists where it genuinely helps.
- "excerpt" is one plain-text sentence summarizing the post, no markdown.
- Aim for roughly 800 to 1400 words unless the topic is naturally a shorter cheatsheet.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 4000,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Write a blog post about: ${topic}` },
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
    if (!raw) {
      return NextResponse.json({ error: "No content returned" }, { status: 502 });
    }

    const draft = JSON.parse(raw) as { title: string; excerpt: string; content: string };
    const tags = curated?.tags ?? [];
    let coverImage: string | null = null;

    if (generateImage) {
      coverImage = await uploadCoverPhoto(admin, {
        seed: curated?.id ?? draft.title,
        cluster: curated?.cluster,
        tags: curated?.tags ?? tags,
      });
    }

    if (!save && !publish && !publishAt) {
      return NextResponse.json({
        ...draft,
        tags,
        cover_image: coverImage,
        topicId: curated?.id ?? null,
      });
    }

    const baseSlug = slugify(draft.title);
    let slug = baseSlug;
    for (let i = 0; i < 5; i += 1) {
      const candidate = i === 0 ? baseSlug : `${baseSlug}-${i + 1}`;
      const { data: existing } = await admin.from("posts").select("id").eq("slug", candidate).maybeSingle();
      if (!existing) {
        slug = candidate;
        break;
      }
    }

    const shouldPublish = Boolean(publish || publishAt);
    const publishedAt = publishAt
      ? publishAt.toISOString()
      : publish
        ? new Date().toISOString()
        : null;

    const payload = {
      title: draft.title,
      slug,
      excerpt: draft.excerpt,
      content: draft.content,
      cover_image: coverImage,
      tags,
      status: shouldPublish ? "published" : "draft",
      ai_generated: true,
      published_at: publishedAt,
      updated_at: new Date().toISOString(),
    };

    const { data: post, error: insertError } = await admin
      .from("posts")
      .insert(payload)
      .select("id, slug, title, status, cover_image, published_at")
      .single();

    if (insertError || !post) {
      return NextResponse.json({ error: insertError?.message ?? "Could not save post" }, { status: 500 });
    }

    return NextResponse.json({
      ...draft,
      tags,
      cover_image: coverImage,
      topicId: curated?.id ?? null,
      saved: post,
    });
  } catch (err) {
    console.error("generate-post failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Generation failed" },
      { status: 500 },
    );
  }
}
