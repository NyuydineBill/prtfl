"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/admin/sign-out-button";

const links = [
  { href: "/admin", label: "Articles" },
  { href: "/admin/comments", label: "Comments" },
  { href: "/admin/guestbook", label: "Guestbook" },
  { href: "/admin/subscribers", label: "Subscribers" },
];

export function AdminNav() {
  const pathname = usePathname();
  if (pathname === "/admin/login") return null;

  return (
    <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
      <nav className="flex flex-wrap items-center gap-5">
        {links.map((link) => {
          const active = link.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm ${active ? "text-accent" : "text-muted hover:text-foreground"}`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <SignOutButton />
    </div>
  );
}
