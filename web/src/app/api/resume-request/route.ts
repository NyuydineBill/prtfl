import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail, getAdminEmail, escapeHtml } from "@/lib/email";
import { profile } from "@/lib/data/profile";

const MAX_NAME = 80;
const MAX_EMAIL = 120;
const MAX_COMPANY = 120;
const MAX_ROLE = 120;
const MAX_MESSAGE = 1000;

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const company = typeof body?.company === "string" ? body.company.trim() : "";
  const role = typeof body?.role === "string" ? body.role.trim() : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const website = typeof body?.website === "string" ? body.website.trim() : "";

  // Honeypot: real visitors never fill this.
  if (website) {
    return NextResponse.json({ error: "Unable to submit request" }, { status: 400 });
  }

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }

  if (
    name.length > MAX_NAME ||
    email.length > MAX_EMAIL ||
    company.length > MAX_COMPANY ||
    role.length > MAX_ROLE ||
    message.length > MAX_MESSAGE
  ) {
    return NextResponse.json({ error: "One or more fields are too long" }, { status: 400 });
  }

  const details = [
    company ? `Company: ${company}` : null,
    role ? `Role: ${role}` : null,
    message ? `Note:\n${message}` : "Note: (none provided)",
  ]
    .filter(Boolean)
    .join("\n");

  const storedMessage = [
    "Résumé request",
    company ? `Company: ${company}` : null,
    role ? `Role: ${role}` : null,
    message ? `Note: ${message}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const supabase = await createClient();
  if (supabase) {
    const { error } = await supabase.from("messages").insert({
      name,
      email,
      subject: "Résumé request",
      message: storedMessage,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  const recipients = new Set<string>();
  const adminEmail = getAdminEmail();
  if (adminEmail) recipients.add(adminEmail);
  if (profile.email) recipients.add(profile.email);

  if (recipients.size === 0) {
    return NextResponse.json(
      { error: "Resume requests are not configured yet. Email me directly instead." },
      { status: 503 },
    );
  }

  const html = `
    <p><strong>${escapeHtml(name)}</strong> (${escapeHtml(email)}) requested your résumé.</p>
    <p>${escapeHtml(details).replace(/\n/g, "<br />")}</p>
    <p><small>Reply to this person directly to share the résumé if appropriate.</small></p>
  `;
  const text = `${name} (${email}) requested your résumé.\n\n${details}\n\nReply directly to share the résumé if appropriate.`;

  const results = await Promise.all(
    [...recipients].map((to) =>
      sendEmail({
        to,
        subject: `Résumé request from ${name}`,
        html,
        text,
      }),
    ),
  );

  if (results.every((result) => !result.ok)) {
    return NextResponse.json(
      { error: results[0]?.error ?? "Could not send the request email" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
