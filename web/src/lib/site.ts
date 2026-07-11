import type { Metadata } from "next";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://nyuydine.online").replace(/\/$/, "");

export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type: "website" },
    twitter: { card: "summary", title, description },
  };
}
