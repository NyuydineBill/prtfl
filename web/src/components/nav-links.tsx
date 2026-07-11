"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "About" },
  { href: "/work", label: "Work" },
  { href: "/stack", label: "Stack" },
  { href: "/experience", label: "Experience" },
  { href: "/community", label: "Community" },
  { href: "/articles", label: "Articles" },
  { href: "/guestbook", label: "Guestbook" },
  { href: "/contact", label: "Contact" },
];

export function NavLinks({
  onNavigate,
  className = "",
  itemClassName = "",
}: {
  onNavigate?: () => void;
  className?: string;
  itemClassName?: string;
}) {
  const pathname = usePathname();

  return (
    <nav className={className}>
      {links.map((link) => {
        const active =
          link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={`${itemClassName} border-b-2 pb-0.5 text-sm transition-colors ${
              active
                ? "border-accent text-foreground"
                : "border-transparent text-muted hover:border-border hover:text-foreground"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
