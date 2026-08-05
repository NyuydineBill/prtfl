import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { projects } from "@/lib/data/projects";
import { services } from "@/lib/data/services";
import { absoluteUrl, siteUrl } from "@/lib/site";

async function getPublishedArticles() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return [];

  const supabase = createClient(url, anonKey);
  const { data } = await supabase
    .from("posts")
    .select("slug, updated_at, cover_image")
    .eq("status", "published");

  return data ?? [];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    {
      url: `${siteUrl}/services`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.95,
    },
    { url: `${siteUrl}/work`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/articles`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    {
      url: `${siteUrl}/experience`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    { url: `${siteUrl}/stack`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    {
      url: `${siteUrl}/community`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/guestbook`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.4,
    },
    { url: `${siteUrl}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
  ];

  const serviceRoutes: MetadataRoute.Sitemap = services.map((service) => ({
    url: `${siteUrl}/services/${service.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${siteUrl}/work/${project.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: project.featured ? 0.8 : 0.6,
    images: project.screenshot ? [absoluteUrl(project.screenshot)] : undefined,
  }));

  const articles = await getPublishedArticles();
  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${siteUrl}/articles/${article.slug}`,
    lastModified: article.updated_at ? new Date(article.updated_at) : now,
    changeFrequency: "monthly",
    priority: 0.7,
    images: article.cover_image ? [article.cover_image] : undefined,
  }));

  return [...staticRoutes, ...serviceRoutes, ...projectRoutes, ...articleRoutes];
}
