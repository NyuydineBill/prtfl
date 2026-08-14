import Link from "next/link";
import Image from "next/image";
import { GraduationCap, ArrowRight, Layers, Sparkles, Cloud, type LucideIcon } from "lucide-react";
import { GithubIcon } from "@/components/brand-icons";
import { profile } from "@/lib/data/profile";
import { projects } from "@/lib/data/projects";
import { services } from "@/lib/data/services";
import { experience } from "@/lib/data/experience";
import { Eyebrow, SectionHeading, StatusPill } from "@/components/ui";
import { Reveal, RevealGroup, RevealItem } from "@/components/reveal";
import { AnimatedNumber } from "@/components/animated-number";
import { HeroHeadline } from "@/components/hero-headline";
import { TiltCard } from "@/components/tilt-card";
import { AmbientGlow } from "@/components/ambient-glow";
import { ResumeRequestButton } from "@/components/resume-request";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: `${profile.name} · ${profile.role}`,
  description:
    "Senior software engineer and architect available for remote engagements across AI products, full-stack development, architecture consulting, and mentoring.",
  path: "/",
  absoluteTitle: true,
});

const expertiseIcons: LucideIcon[] = [Layers, Sparkles, Cloud];

export default function HomePage() {
  const currentRole = experience[0];
  const featuredProjects = projects.filter((project) => project.featured);
  const degree = profile.education[0];

  return (
    <div className="flex flex-col gap-16 sm:gap-20 lg:gap-28">
      {/* Hero */}
      <section className="grid gap-10 sm:gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <Reveal>
          <StatusPill>Available for select engagements</StatusPill>
          <HeroHeadline
            text={profile.headline}
            className="mt-6 text-4xl font-semibold leading-[1.1] text-foreground sm:text-5xl"
          />
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted">
            {profile.tagline}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/services"
              className="rounded-md bg-accent px-5 py-3 text-sm font-medium text-background transition-transform hover:-translate-y-0.5 hover:opacity-90"
            >
              View services
            </Link>
            <Link
              href="/work"
              className="rounded-md border border-border px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
            >
              Explore my work
            </Link>
            <ResumeRequestButton className="rounded-md border border-border px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent" />
          </div>
        </Reveal>

        {/* Framed hero photo */}
        <Reveal delay={0.1}>
          <div className="relative mx-auto w-full max-w-sm" style={{ perspective: 1000 }}>
            <AmbientGlow className="absolute -inset-6 -z-20 rounded-[2.5rem] bg-[conic-gradient(from_0deg,rgba(95,208,232,0.16),transparent_30%,rgba(232,184,114,0.14),transparent_70%,rgba(95,208,232,0.16))] blur-xl" />
            <div className="absolute -inset-3 -z-10 rotate-2 rounded-[2rem] border border-accent/30" />

            <TiltCard className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-border bg-surface shadow-2xl">
              <Image
                src="/hero-photo.jpg"
                alt={profile.name}
                width={480}
                height={600}
                className="h-full w-full object-cover"
                priority
              />
            </TiltCard>

            <div className="absolute -bottom-5 -left-5 flex items-center gap-2.5 rounded-xl border border-border bg-surface/90 px-3.5 py-2.5 shadow-xl backdrop-blur-sm">
              <GraduationCap className="h-4 w-4 shrink-0 text-accent" />
              <div className="leading-tight">
                <p className="text-xs font-medium text-foreground">{degree.credential}</p>
                <p className="font-mono text-[11px] text-muted">
                  {degree.institution} · {degree.period}
                </p>
              </div>
            </div>

            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              className="absolute -top-5 -right-5 flex items-center gap-2.5 rounded-xl border border-border bg-surface/90 px-3.5 py-2.5 shadow-xl backdrop-blur-sm transition-colors hover:border-accent/60"
            >
              <GithubIcon className="h-4 w-4 shrink-0 text-accent" />
              <div className="leading-tight">
                <p className="text-xs font-medium text-foreground">
                  {profile.github_stats.publicRepos} repositories
                </p>
                <p className="font-mono text-[11px] text-muted">Open-source since {profile.github_stats.memberSince}</p>
              </div>
            </a>
          </div>
        </Reveal>

        <dl className="col-span-full grid grid-cols-2 gap-6 border-t border-border pt-8 sm:grid-cols-4">
          {profile.stats.map((stat) => (
            <div key={stat.label}>
              <dt className="font-mono text-3xl font-semibold text-foreground">
                <AnimatedNumber value={stat.value} />
              </dt>
              <dd className="mt-1 text-sm text-muted">{stat.label}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* About */}
      <Reveal>
        <SectionHeading index={1} eyebrow="About" title="How I work" />
        <p className="max-w-3xl text-lg leading-relaxed text-muted">{profile.summary}</p>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted">
          I hold a {degree.credential} from {degree.institution} ({degree.period}), alongside the production work below.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {profile.domains.map((domain) => (
            <span
              key={domain}
              className="rounded-md border border-border px-2.5 py-1 text-xs text-muted"
            >
              {domain}
            </span>
          ))}
        </div>
      </Reveal>

      {/* Core expertise */}
      <section>
        <Reveal>
          <SectionHeading index={2} eyebrow="Core expertise" title="What I focus on" />
        </Reveal>
        <RevealGroup className="grid gap-4 sm:grid-cols-3">
          {profile.expertise.map((item, i) => {
            const Icon = expertiseIcons[i];
            return (
              <RevealItem key={item.title}>
                <div className="h-full rounded-lg border border-border bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 hover:shadow-[0_0_30px_-12px_var(--color-accent)]">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-accent/30 bg-accent/10">
                    <Icon className="h-5 w-5 text-accent" />
                  </span>
                  <h3 className="mt-4 text-lg font-medium text-foreground">{item.title}</h3>
                  <p className="mt-2 text-base leading-relaxed text-muted">
                    {item.description}
                  </p>
                </div>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </section>

      {/* Services */}
      <section>
        <Reveal>
          <SectionHeading
            index={3}
            eyebrow="Services"
            title="Engagements I take on"
            description="Remote work across AI products, full-stack delivery, architecture, and mentoring. Each page explains fit, process, and related case studies."
          />
        </Reveal>
        <RevealGroup className="grid gap-4 sm:grid-cols-2">
          {services.map((service) => (
            <RevealItem key={service.slug}>
              <Link
                href={`/services/${service.slug}`}
                className="group block h-full rounded-lg border border-border bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 hover:shadow-[0_0_30px_-12px_var(--color-accent)]"
              >
                <Eyebrow>{service.category}</Eyebrow>
                <h3 className="mt-2 flex items-center gap-1.5 text-lg font-medium text-foreground group-hover:text-accent">
                  {service.name}
                  <ArrowRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                </h3>
                <p className="mt-2 text-base leading-relaxed text-muted">{service.description}</p>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* Featured projects */}
      <section>
        <Reveal>
          <SectionHeading
            index={4}
            eyebrow="Selected work"
            title="Flagship projects"
            description="A few of the systems I've architected end to end. Full list of projects on the work page."
          />
        </Reveal>
        <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProjects.map((project) => (
            <RevealItem key={project.slug}>
              <Link
                href={`/work/${project.slug}`}
                className="group block h-full rounded-lg border border-border bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 hover:shadow-[0_0_30px_-12px_var(--color-accent)]"
              >
                <Eyebrow>{project.status}</Eyebrow>
                <h3 className="mt-2 flex items-center gap-1.5 text-lg font-medium text-foreground group-hover:text-accent">
                  {project.name}
                  <ArrowRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                </h3>
                <p className="mt-2 text-base leading-relaxed text-muted">
                  {project.summary}
                </p>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* Beyond the code teaser */}
      <Reveal>
        <div className="flex flex-col items-start gap-5 rounded-lg border border-border bg-surface p-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-accent/40 bg-accent/10">
              <GraduationCap className="h-5 w-5 text-accent" />
            </span>
            <div>
              <h2 className="text-lg font-medium text-foreground">
                Also an educator, mentor & community leader
              </h2>
              <p className="mt-1 max-w-xl text-base text-muted">
                Tutoring, IT instruction, and leading the Microsoft Learn Student Ambassadors chapter at the University of Bamenda.
              </p>
            </div>
          </div>
          <Link
            href="/community"
            className="shrink-0 rounded-md border border-border px-4 py-2.5 text-sm text-foreground hover:border-accent hover:text-accent"
          >
            See teaching & leadership →
          </Link>
        </div>
      </Reveal>

      {/* Current role */}
      <Reveal>
        <SectionHeading index={5} eyebrow="Currently" title="What I'm doing now" />
        <div className="rounded-lg border border-border bg-surface p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-medium text-foreground">
              {currentRole.role} · {currentRole.org}
            </h3>
            <span className="font-mono text-xs text-muted">
              {currentRole.period}
            </span>
          </div>
          {currentRole.summary && (
            <p className="mt-2 text-base leading-relaxed text-muted">
              {currentRole.summary}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-4">
            <Link href="/services" className="text-sm text-accent hover:underline">
              See how we can work together →
            </Link>
            <Link href="/experience" className="text-sm text-accent hover:underline">
              Full experience timeline →
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
