"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/brand-icons";
import { NavLinks } from "@/components/nav-links";
import { Footer } from "@/components/footer";
import { ChatWidget } from "@/components/chat-widget";
import { profile } from "@/lib/data/profile";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/profile.jpeg"
              alt={profile.name}
              width={34}
              height={34}
              className="h-[34px] w-[34px] rounded-full border border-border object-cover"
            />
            <span className="hidden font-mono text-sm text-foreground sm:inline">
              {profile.name}
            </span>
          </Link>

          <NavLinks className="hidden items-center gap-5 xl:gap-7 lg:flex" />

          <div className="hidden items-center gap-4 lg:flex">
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="text-muted hover:text-foreground"
            >
              <GithubIcon className="h-[18px] w-[18px]" />
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="text-muted hover:text-foreground"
            >
              <LinkedinIcon className="h-[18px] w-[18px]" />
            </a>
            <a
              href={profile.resumeHref}
              download
              className="rounded-md bg-accent px-3.5 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Download résumé
            </a>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-md border border-border p-2 text-muted lg:hidden"
            aria-expanded={open}
            aria-label="Toggle navigation"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {open && (
          <div className="border-t border-border px-4 py-4 lg:hidden">
            <NavLinks
              className="flex flex-col gap-3"
              itemClassName="w-fit"
              onNavigate={() => setOpen(false)}
            />
            <div className="mt-4 flex items-center gap-4 border-t border-border pt-4">
              <a href={profile.github} target="_blank" rel="noreferrer" className="text-muted hover:text-foreground">
                <GithubIcon className="h-[18px] w-[18px]" />
              </a>
              <a href={profile.linkedin} target="_blank" rel="noreferrer" className="text-muted hover:text-foreground">
                <LinkedinIcon className="h-[18px] w-[18px]" />
              </a>
              <a
                href={profile.resumeHref}
                download
                className="ml-auto rounded-md bg-accent px-3.5 py-2 text-sm font-medium text-background"
              >
                Download résumé
              </a>
            </div>
          </div>
        )}
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-12 px-4 sm:px-8">
        {/* Persistent sidebar (desktop only) */}
        <aside className="hidden shrink-0 lg:sticky lg:top-16 lg:block lg:h-fit lg:w-64 lg:py-14">
          <Image
            src="/profile.jpeg"
            alt={profile.name}
            width={76}
            height={76}
            className="h-[76px] w-[76px] rounded-full border border-border object-cover"
          />
          <h1 className="mt-4 text-lg font-semibold leading-tight text-foreground">
            {profile.name}
          </h1>
          <p className="mt-1 text-sm text-muted">{profile.role}</p>

          <div className="mt-5 flex flex-col gap-2 border-t border-border pt-5">
            {profile.identities.map((identity) => (
              <span key={identity} className="font-mono text-xs text-muted">
                {identity}
              </span>
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-border pt-5">
            <a
              href={`mailto:${profile.email}`}
              className="text-sm text-muted hover:text-foreground"
            >
              {profile.email}
            </a>
            <span className="text-sm text-muted">{profile.location}</span>
          </div>
        </aside>

        <main className="min-w-0 flex-1 py-8 sm:py-20">
          {children}
          <Footer />
        </main>
      </div>

      {!isAdmin && <ChatWidget />}
    </div>
  );
}
