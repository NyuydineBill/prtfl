import Link from "next/link";
import { profile } from "@/lib/data/profile";
import { services } from "@/lib/data/services";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border pt-8 text-sm text-muted">
      <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
        <div>
          <p className="text-foreground">© {new Date().getFullYear()} {profile.name}</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed">
            Remote AI product engineering, full-stack development, architecture consulting, and mentoring.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-accent">Explore</p>
            <ul className="mt-3 flex flex-col gap-2">
              <li>
                <Link href="/services" className="hover:text-foreground">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/work" className="hover:text-foreground">
                  Work
                </Link>
              </li>
              <li>
                <Link href="/articles" className="hover:text-foreground">
                  Articles
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-accent">Services</p>
            <ul className="mt-3 flex flex-col gap-2">
              {services.map((service) => (
                <li key={service.slug}>
                  <Link href={`/services/${service.slug}`} className="hover:text-foreground">
                    {service.shortName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-accent">Connect</p>
            <ul className="mt-3 flex flex-col gap-2">
              <li>
                <a href={`mailto:${profile.email}`} className="hover:text-foreground">
                  Email
                </a>
              </li>
              <li>
                <a href={profile.github} target="_blank" rel="noreferrer" className="hover:text-foreground">
                  GitHub
                </a>
              </li>
              <li>
                <a href={profile.linkedin} target="_blank" rel="noreferrer" className="hover:text-foreground">
                  LinkedIn
                </a>
              </li>
              <li>
                <Link href="/feed.xml" className="hover:text-foreground">
                  RSS
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
