import { profile } from "@/lib/data/profile";
import type { Project } from "@/lib/data/projects";
import type { Service } from "@/lib/data/services";
import type { Post } from "@/lib/posts";
import { absoluteUrl, siteName, siteUrl } from "@/lib/site";

type BreadcrumbItem = { name: string; path: string };

export function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${siteUrl}/#person`,
    name: profile.name,
    url: siteUrl,
    image: absoluteUrl("/profile.jpeg"),
    jobTitle: profile.role,
    description: profile.summary,
    email: profile.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bamenda",
      addressCountry: "CM",
    },
    sameAs: [profile.github, profile.linkedin],
    knowsAbout: [
      "Software architecture",
      "AI systems engineering",
      "Full-stack development",
      "Cloud infrastructure",
      "Engineering mentoring",
      ...profile.domains,
    ],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: siteName,
    url: siteUrl,
    description: profile.tagline,
    inLanguage: "en",
    publisher: { "@id": `${siteUrl}/#person` },
    author: { "@id": `${siteUrl}/#person` },
  };
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function serviceSchema(service: Service) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    url: absoluteUrl(`/services/${service.slug}`),
    provider: { "@id": `${siteUrl}/#person` },
    areaServed: "Worldwide",
    serviceType: service.name,
    category: service.category,
  };
}

export function creativeWorkSchema(project: Project) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.name,
    description: project.summary,
    url: absoluteUrl(`/work/${project.slug}`),
    image: project.screenshot ? absoluteUrl(project.screenshot) : undefined,
    creator: { "@id": `${siteUrl}/#person` },
    author: { "@id": `${siteUrl}/#person` },
    keywords: project.stack.join(", "),
    about: project.category,
  };
}

export function articleSchema(post: Post) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.cover_image ? [post.cover_image] : undefined,
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at ?? undefined,
    author: {
      "@type": "Person",
      "@id": `${siteUrl}/#person`,
      name: profile.name,
      url: siteUrl,
    },
    publisher: {
      "@type": "Person",
      "@id": `${siteUrl}/#person`,
      name: profile.name,
    },
    mainEntityOfPage: absoluteUrl(`/articles/${post.slug}`),
    keywords: post.tags?.join(", "),
  };
}
