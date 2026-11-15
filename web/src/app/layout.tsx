import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SiteShell } from "@/components/site-shell";
import { JsonLd } from "@/components/json-ld";
import { personSchema, websiteSchema } from "@/lib/schema";
import { profile } from "@/lib/data/profile";
import {
  absoluteUrl,
  defaultDescription,
  defaultOgImage,
  siteName,
  siteUrl,
} from "@/lib/site";

// Self-hosted so Vercel builds do not depend on fetching Google Fonts at build time.
const hanken = localFont({
  src: "./fonts/hanken-grotesk.woff2",
  variable: "--font-hanken",
  weight: "400 700",
  display: "swap",
});

const jetbrainsMono = localFont({
  src: "./fonts/jetbrains-mono.woff2",
  variable: "--font-jetbrains",
  weight: "400 600",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${profile.name} · ${profile.role}`,
    template: `%s · ${profile.name}`,
  },
  description: defaultDescription,
  keywords: [
    profile.name,
    "Software Engineer",
    "Software Architect",
    "Full-Stack Developer",
    "AI Engineer",
    "AI product engineering",
    "remote software engineer",
    "software architecture consulting",
    "engineering mentoring",
    ...profile.domains,
  ],
  authors: [{ name: profile.name, url: siteUrl }],
  creator: profile.name,
  publisher: profile.name,
  category: "technology",
  alternates: {
    canonical: siteUrl,
    types: {
      "application/rss+xml": absoluteUrl("/feed.xml"),
    },
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName,
    locale: "en_US",
    title: `${profile.name} · ${profile.role}`,
    description: defaultDescription,
    images: [defaultOgImage],
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} · ${profile.role}`,
    description: defaultDescription,
    images: [defaultOgImage.url],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : undefined,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${hanken.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <JsonLd data={[personSchema(), websiteSchema()]} />
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
