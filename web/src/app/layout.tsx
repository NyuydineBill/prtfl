import type { Metadata } from "next";
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SiteShell } from "@/components/site-shell";
import { profile } from "@/lib/data/profile";
import { siteUrl } from "@/lib/site";

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${profile.name} · ${profile.role}`,
    template: `%s · ${profile.name}`,
  },
  description: profile.tagline,
  keywords: [
    profile.name,
    "Software Engineer",
    "Software Architect",
    "Full-Stack Developer",
    "AI Engineer",
    ...profile.domains,
  ],
  authors: [{ name: profile.name, url: siteUrl }],
  alternates: { canonical: siteUrl },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: `${profile.name} · ${profile.role}`,
    title: `${profile.name} · ${profile.role}`,
    description: profile.tagline,
    images: [{ url: "/hero-photo.jpg", width: 812, height: 1080, alt: profile.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} · ${profile.role}`,
    description: profile.tagline,
    images: ["/hero-photo.jpg"],
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
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
