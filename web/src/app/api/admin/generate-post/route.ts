import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { profile } from "@/lib/data/profile";

export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY is not configured" }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const topic = body?.topic;
  if (!topic || typeof topic !== "string") {
    return NextResponse.json({ error: "Missing topic" }, { status: 400 });
  }

  const openai = new OpenAI({ apiKey });

  const systemPrompt = `You are drafting a blog post for ${profile.name}'s personal engineering blog, written in first person as ${profile.name}.

Background, for voice and grounding only, do not repeat this verbatim: ${profile.summary}

Rules:
- Write in first person, as ${profile.name} would write it himself.
- Do not invent specific metrics, client names, employers, or achievements beyond what the topic itself implies. When unsure, keep claims general rather than fabricating specifics.
- Direct, technical tone. No marketing language, no filler, no generic AI-sounding phrasing ("in today's fast-paced world", "let's dive in").
- "content" is valid Markdown: use headings, code blocks, and lists where it genuinely helps.
- "excerpt" is one plain-text sentence summarizing the post, no markdown.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 3000,
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

    const draft = JSON.parse(raw);
    return NextResponse.json(draft);
  } catch (err) {
    console.error("generate-post failed:", err);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
