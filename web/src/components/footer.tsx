import { profile } from "@/lib/data/profile";

export function Footer() {
  return (
    <footer className="mt-24 flex flex-col gap-3 border-t border-border pt-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
      <p>© {new Date().getFullYear()} {profile.name}</p>
      <div className="flex gap-5">
        <a href={`mailto:${profile.email}`} className="hover:text-foreground">
          Email
        </a>
        <a href={profile.github} target="_blank" rel="noreferrer" className="hover:text-foreground">
          GitHub
        </a>
        <a href={profile.linkedin} target="_blank" rel="noreferrer" className="hover:text-foreground">
          LinkedIn
        </a>
      </div>
    </footer>
  );
}
