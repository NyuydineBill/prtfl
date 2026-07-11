import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail, getAdminEmail, escapeHtml } from "@/lib/email";

export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const postId = typeof body?.postId === "string" ? body.postId : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const commentBody = typeof body?.body === "string" ? body.body.trim() : "";

  if (!postId || !name || !commentBody) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { error } = await supabase
    .from("comments")
    .insert({ post_id: postId, name, body: commentBody });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const adminEmail = getAdminEmail();
  if (adminEmail) {
    await sendEmail({
      to: adminEmail,
      subject: "New comment pending review",
      html: `<p><strong>${escapeHtml(name)}</strong> commented:</p><p>${escapeHtml(commentBody).replace(/\n/g, "<br />")}</p>`,
      text: `${name} commented:\n\n${commentBody}`,
    });
  }

  return NextResponse.json({ ok: true });
}
