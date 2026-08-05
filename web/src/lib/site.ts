import type { Metadata } from "next";
import { profile } from "@/lib/data/profile";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://nyuydine.online").replace(
  /\/$/,
  "",
);

export const siteName = `${profile.name} · ${profile.role}`;

export const defaultDescription =
  "Senior software engineer and architect available for remote engagements. AI product engineering, full-stack development, software architecture consulting, and engineering mentoring.";

/** Shared social preview used when a route does not supply its own image. */
export const defaultOgImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${profile.name} — ${profile.role}`,
} as const;

export function absoluteUrl(path = "/") {
  if (!path || path === "/") return siteUrl;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  noIndex = false,
  absoluteTitle = false,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  noIndex?: boolean;
  absoluteTitle?: boolean;
}): Metadata {
  const ogImage = image
    ? [{ url: image, width: 1200, height: 630, alt: title }]
    : [defaultOgImage];

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: path,
      types: {
        "application/rss+xml": absoluteUrl("/feed.xml"),
      },
    },
    openGraph: {
      title,
      description,
      url: path,
      siteName,
      type,
      locale: "en_US",
      images: ogImage,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [defaultOgImage.url],
    },
    robots: noIndex ? { index: false, follow: false } : undefined,
  };
}
