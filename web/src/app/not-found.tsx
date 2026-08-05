import Link from "next/link";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Page not found",
    description: "The page you requested does not exist on this site.",
    path: "/404",
    noIndex: true,
  }),
};

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl py-10 text-center sm:py-16">
      <p className="font-mono text-xs uppercase tracking-wider text-accent">404</p>
      <h1 className="mt-3 text-3xl font-semibold text-foreground">Page not found</h1>
      <p className="mt-3 text-base leading-relaxed text-muted">
        That URL is not part of this site. Try one of the main sections below.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          Home
        </Link>
        <Link
          href="/services"
          className="rounded-md border border-border px-4 py-2 text-sm text-foreground hover:border-accent hover:text-accent"
        >
          Services
        </Link>
        <Link
          href="/work"
          className="rounded-md border border-border px-4 py-2 text-sm text-foreground hover:border-accent hover:text-accent"
        >
          Work
        </Link>
        <Link
          href="/contact"
          className="rounded-md border border-border px-4 py-2 text-sm text-foreground hover:border-accent hover:text-accent"
        >
          Contact
        </Link>
      </div>
    </div>
  );
}
