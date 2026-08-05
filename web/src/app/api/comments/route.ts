import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail, getAdminEmail, escapeHtml } from "@/lib/email";

const MAX_NAME_LENGTH = 80;
const MAX_COMMENT_LENGTH = 2_000;

export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const postId = typeof body?.postId === "string" ? body.postId : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const commentBody = typeof body?.body === "string" ? body.body.trim() : "";
  const parentId = typeof body?.parentId === "string" ? body.parentId : null;
  const website = typeof body?.website === "string" ? body.website.trim() : "";

  if (!postId || !name || !commentBody) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Honeypot: real visitors never see or fill this field.
  if (website) {
    return NextResponse.json({ error: "Unable to post comment" }, { status: 400 });
  }

  if (name.length > MAX_NAME_LENGTH || commentBody.length > MAX_COMMENT_LENGTH) {
    return NextResponse.json(
      { error: `Names are limited to ${MAX_NAME_LENGTH} characters and comments to ${MAX_COMMENT_LENGTH}.` },
      { status: 400 },
    );
  }

  if (parentId) {
    const { data: parent } = await supabase
      .from("comments")
      .select("id")
      .eq("id", parentId)
      .eq("post_id", postId)
      .eq("status", "approved")
      .maybeSingle();

    if (!parent) {
      return NextResponse.json({ error: "The comment being replied to was not found" }, { status: 400 });
    }
  }

  const { data: comment, error } = await supabase
    .from("comments")
    .insert({
      post_id: postId,
      parent_id: parentId,
      name,
      body: commentBody,
      status: "approved",
    })
    .select("id, post_id, parent_id, name, body, status, created_at")
    .single();

  if (error || !comment) {
    return NextResponse.json(
      { error: error?.message ?? "Comment could not be saved" },
      { status: 500 },
    );
  }

  const adminEmail = getAdminEmail();
  if (adminEmail) {
    await sendEmail({
      to: adminEmail,
      subject: parentId ? "New article comment reply" : "New article comment",
      html: `<p><strong>${escapeHtml(name)}</strong> ${parentId ? "replied" : "commented"}:</p><p>${escapeHtml(commentBody).replace(/\n/g, "<br />")}</p><p><small>Published automatically. You can remove it from the admin comments page.</small></p>`,
      text: `${name} ${parentId ? "replied" : "commented"}:\n\n${commentBody}\n\nPublished automatically.`,
    });
  }

  return NextResponse.json({ ok: true, comment });
}
