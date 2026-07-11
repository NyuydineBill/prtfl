import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT ?? 465);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;

export const isEmailConfigured = Boolean(host && user && pass);

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (!isEmailConfigured) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }
  return transporter;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const client = getTransporter();
  if (!client) {
    console.warn("sendEmail skipped — SMTP is not configured");
    return { ok: false, error: "SMTP is not configured" };
  }

  const from = process.env.EMAIL_FROM;
  if (!from) {
    console.warn("sendEmail skipped — EMAIL_FROM is not configured");
    return { ok: false, error: "EMAIL_FROM is not configured" };
  }

  try {
    await client.sendMail({ from, to, subject, html, text });
    return { ok: true };
  } catch (err) {
    console.error("sendEmail failed:", err);
    return { ok: false, error: err instanceof Error ? err.message : "Send failed" };
  }
}

export function getAdminEmail(): string | null {
  return process.env.ADMIN_EMAIL ?? null;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
