"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { services } from "@/lib/data/services";

type NavItem = { href: string; label: string; description?: string };
type NavGroup = { label: string; items: NavItem[] };
type NavEntry = NavItem | NavGroup;

function isGroup(entry: NavEntry): entry is NavGroup {
  return "items" in entry;
}

const navigation: NavEntry[] = [
  { href: "/", label: "About" },
  {
    label: "Services",
    items: [
      { href: "/services", label: "All services", description: "How engagements work" },
      ...services.map((service) => ({
        href: `/services/${service.slug}`,
        label: service.name,
        description: service.headline,
      })),
    ],
  },
  { href: "/work", label: "Work" },
  { href: "/articles", label: "Articles" },
  {
    label: "More",
    items: [
      { href: "/experience", label: "Experience", description: "Roles and production systems" },
      { href: "/stack", label: "Stack", description: "Languages, frameworks, infrastructure" },
      { href: "/community", label: "Community", description: "Teaching and leadership" },
      { href: "/guestbook", label: "Guestbook", description: "Leave a note" },
    ],
  },
  { href: "/contact", label: "Contact" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

const linkClasses = (active: boolean) =>
  `border-b-2 pb-0.5 text-sm transition-colors ${
    active
      ? "border-accent text-foreground"
      : "border-transparent text-muted hover:border-border hover:text-foreground"
  }`;

function NavDropdown({ group, pathname }: { group: NavGroup; pathname: string }) {
  const [open, setOpen] = useState(false);
  const [renderedPath, setRenderedPath] = useState(pathname);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const groupActive = group.items.some((item) => isActive(pathname, item.href));

  if (pathname !== renderedPath) {
    setRenderedPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className={`inline-flex items-center gap-1 ${linkClasses(groupActive)}`}
      >
        {group.label}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {/* Kept in the DOM when closed so crawlers still follow these links. */}
      <div
        id={menuId}
        aria-hidden={!open}
        className={`absolute left-0 top-full z-50 w-72 pt-3 transition-opacity duration-150 ${
          open ? "visible opacity-100" : "pointer-events-none invisible opacity-0"
        }`}
      >
        <ul className="overflow-hidden rounded-lg border border-border bg-surface p-1.5 shadow-xl">
          {group.items.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  tabIndex={open ? undefined : -1}
                  onClick={() => setOpen(false)}
                  className={`block rounded-md px-3 py-2 transition-colors ${
                    active ? "bg-accent/10 text-accent" : "text-foreground hover:bg-background"
                  }`}
                >
                  <span className="block text-sm">{item.label}</span>
                  {item.description && (
                    <span className="mt-0.5 block text-xs leading-snug text-muted">
                      {item.description}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export function NavLinks({
  onNavigate,
  className = "",
  itemClassName = "",
  variant = "desktop",
}: {
  onNavigate?: () => void;
  className?: string;
  itemClassName?: string;
  variant?: "desktop" | "mobile";
}) {
  const pathname = usePathname();

  if (variant === "mobile") {
    return (
      <nav className={className}>
        {navigation.map((entry) =>
          isGroup(entry) ? (
            <div key={entry.label} className="flex flex-col gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-accent">
                {entry.label}
              </span>
              {entry.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={`${itemClassName} pl-3 ${linkClasses(isActive(pathname, item.href))}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ) : (
            <Link
              key={entry.href}
              href={entry.href}
              onClick={onNavigate}
              className={`${itemClassName} ${linkClasses(isActive(pathname, entry.href))}`}
            >
              {entry.label}
            </Link>
          ),
        )}
      </nav>
    );
  }

  return (
    <nav className={className}>
      {navigation.map((entry) =>
        isGroup(entry) ? (
          <NavDropdown key={entry.label} group={entry} pathname={pathname} />
        ) : (
          <Link
            key={entry.href}
            href={entry.href}
            onClick={onNavigate}
            className={`${itemClassName} ${linkClasses(isActive(pathname, entry.href))}`}
          >
            {entry.label}
          </Link>
        ),
      )}
    </nav>
  );
}
