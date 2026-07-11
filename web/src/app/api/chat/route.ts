import { NextResponse } from "next/server";
import { createHash } from "crypto";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { buildKnowledgeBase } from "@/lib/chat-knowledge";
import { profile } from "@/lib/data/profile";

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const ipHash = createHash("sha256").update(ip).digest("hex");

  const { data: allowed, error: rateLimitError } = await supabase.rpc(
    "check_chat_rate_limit",
    { p_ip_hash: ipHash }
  );

  if (rateLimitError) {
    console.error("chat rate limit check failed:", rateLimitError);
    return NextResponse.json({ error: "Rate limit check failed" }, { status: 500 });
  }

  if (!allowed) {
    return NextResponse.json(
      { error: "You've sent a lot of messages — try again in a bit." },
      { status: 429 }
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY is not configured" }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const messages: ChatMessage[] = Array.isArray(body?.messages) ? body.messages : [];
  if (messages.length === 0) {
    return NextResponse.json({ error: "Missing messages" }, { status: 400 });
  }

  // Cap history sent to the model — keeps token usage and cost bounded.
  const recentMessages = messages.slice(-8);

  const systemPrompt = `You are the assistant embedded on ${profile.name}'s portfolio website. You answer visitor questions ONLY using the information below about ${profile.name}'s background, projects, experience, and skills.

Rules:
- Only answer questions about ${profile.name}'s work, background, skills, and projects.
- If asked something unrelated (general knowledge, coding help unrelated to his work, anything not about him), politely say you can only answer questions about ${profile.name}'s work and redirect back on topic.
- Never invent facts, metrics, or claims that aren't in the information below. If you don't know, say so and suggest the visitor use the contact form.
- Keep answers concise and conversational — a few sentences, not an essay.
- Speak about ${profile.name} in the third person (you are an assistant representing him, not him).

${buildKnowledgeBase()}`;

  try {
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 500,
      messages: [
        { role: "system", content: systemPrompt },
        ...recentMessages.map((m) => ({ role: m.role, content: m.content })),
      ],
    });

    const reply = completion.choices[0]?.message?.content;
    if (!reply) {
      return NextResponse.json({ error: "No response generated" }, { status: 502 });
    }

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("chat completion failed:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
