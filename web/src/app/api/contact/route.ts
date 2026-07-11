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
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const subject = typeof body?.subject === "string" ? body.subject.trim() : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { error } = await supabase.from("messages").insert({ name, email, subject, message });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const adminEmail = getAdminEmail();
  if (adminEmail) {
    await sendEmail({
      to: adminEmail,
      subject: `New contact message${subject ? `: ${subject}` : ""}`,
      html: `<p><strong>${escapeHtml(name)}</strong> (${escapeHtml(email)}) wrote:</p><p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>`,
      text: `${name} (${email}) wrote:\n\n${message}`,
    });
  }

  return NextResponse.json({ ok: true });
}
