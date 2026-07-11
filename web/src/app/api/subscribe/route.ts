import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { profile } from "@/lib/data/profile";

export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  const { error } = await supabase.from("subscribers").insert({ email });

  if (error) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
  }

  await sendEmail({
    to: email,
    subject: `You're subscribed — ${profile.name}`,
    html: `<p>Thanks for subscribing. You'll get a short email whenever I publish a new article. No spam, unsubscribe anytime by replying to any of these emails.</p>`,
    text: "Thanks for subscribing. You'll get a short email whenever I publish a new article. No spam, unsubscribe anytime by replying to any of these emails.",
  });

  return NextResponse.json({ ok: true });
}
