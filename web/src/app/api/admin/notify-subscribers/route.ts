import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
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

  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title : "";
  const slug = typeof body?.slug === "string" ? body.slug : "";
  const excerpt = typeof body?.excerpt === "string" ? body.excerpt : "";

  if (!title || !slug) {
    return NextResponse.json({ error: "Missing title or slug" }, { status: 400 });
  }

  const { data: subscribers, error } = await supabase
    .from("subscribers")
    .select("email")
    .is("unsubscribed_at", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!subscribers || subscribers.length === 0) {
    return NextResponse.json({ sent: 0, total: 0 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nyuydine.online";
  const articleUrl = `${siteUrl}/articles/${slug}`;

  let sent = 0;
  for (const subscriber of subscribers) {
    const result = await sendEmail({
      to: subscriber.email,
      subject: `New article: ${title}`,
      html: `<p>${profile.name} just published a new article.</p><h2>${title}</h2>${excerpt ? `<p>${excerpt}</p>` : ""}<p><a href="${articleUrl}">${articleUrl}</a></p>`,
      text: `${profile.name} just published a new article.\n\n${title}\n${excerpt}\n\n${articleUrl}`,
    });
    if (result.ok) sent += 1;
  }

  return NextResponse.json({ sent, total: subscribers.length });
}
