import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { projects } from "@/lib/data/projects";
import { siteUrl } from "@/lib/site";

async function getPublishedArticles() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return [];

  const supabase = createClient(url, anonKey);
  const { data } = await supabase
    .from("posts")
    .select("slug, updated_at")
    .eq("status", "published");

  return data ?? [];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/work`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/articles`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/experience`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/stack`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/community`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/guestbook`, changeFrequency: "weekly", priority: 0.4 },
    { url: `${siteUrl}/contact`, changeFrequency: "yearly", priority: 0.4 },
  ];

  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${siteUrl}/work/${project.slug}`,
    changeFrequency: "monthly",
    priority: project.featured ? 0.8 : 0.6,
  }));

  const articles = await getPublishedArticles();
  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${siteUrl}/articles/${article.slug}`,
    lastModified: article.updated_at ? new Date(article.updated_at) : undefined,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...projectRoutes, ...articleRoutes];
}
