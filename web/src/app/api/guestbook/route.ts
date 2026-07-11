import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail, getAdminEmail, escapeHtml } from "@/lib/email";

export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const role = typeof body?.role === "string" ? body.role.trim() : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";

  if (!name || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { error } = await supabase
    .from("guestbook")
    .insert({ name, role: role || null, message });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const adminEmail = getAdminEmail();
  if (adminEmail) {
    await sendEmail({
      to: adminEmail,
      subject: "New guestbook entry pending review",
      html: `<p><strong>${escapeHtml(name)}</strong>${role ? ` (${escapeHtml(role)})` : ""} left a note:</p><p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>`,
      text: `${name}${role ? ` (${role})` : ""} left a note:\n\n${message}`,
    });
  }

  return NextResponse.json({ ok: true });
}
