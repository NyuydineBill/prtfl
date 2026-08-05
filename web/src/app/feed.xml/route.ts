import { createClient } from "@supabase/supabase-js";
import { profile } from "@/lib/data/profile";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 3600;

type FeedPost = {
  slug: string;
  title: string;
  excerpt: string | null;
  published_at: string | null;
  updated_at: string | null;
};

async function getPublishedArticles(): Promise<FeedPost[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return [];

  const supabase = createClient(url, anonKey);
  const { data } = await supabase
    .from("posts")
    .select("slug, title, excerpt, published_at, updated_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(50);

  return data ?? [];
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const articles = await getPublishedArticles();
  const lastBuildDate =
    articles[0]?.updated_at || articles[0]?.published_at || new Date().toISOString();

  const items = articles
    .map((article) => {
      const link = absoluteUrl(`/articles/${article.slug}`);
      const pubDate = article.published_at
        ? new Date(article.published_at).toUTCString()
        : undefined;

      return `<item>
      <title>${escapeXml(article.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      ${article.excerpt ? `<description>${escapeXml(article.excerpt)}</description>` : ""}
      ${pubDate ? `<pubDate>${pubDate}</pubDate>` : ""}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${profile.name} · Articles`)}</title>
    <link>${absoluteUrl("/articles")}</link>
    <description>${escapeXml("Notes on software architecture, AI systems, and building production software.")}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date(lastBuildDate).toUTCString()}</lastBuildDate>
    <atom:link href="${absoluteUrl("/feed.xml")}" rel="self" type="application/rss+xml" />
    <managingEditor>${escapeXml(`${profile.email} (${profile.name})`)}</managingEditor>
    <webMaster>${escapeXml(`${profile.email} (${profile.name})`)}</webMaster>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
