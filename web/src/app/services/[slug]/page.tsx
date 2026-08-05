import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getService, services } from "@/lib/data/services";
import { projects } from "@/lib/data/projects";
import { Chip, Eyebrow } from "@/components/ui";
import { Reveal, RevealGroup, RevealItem } from "@/components/reveal";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema, serviceSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/site";

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) {
    return { title: "Service", robots: { index: false, follow: false } };
  }

  return pageMetadata({
    title: service.name,
    description: service.description,
    path: `/services/${service.slug}`,
  });
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const relatedProjects = projects.filter((project) =>
    service.relatedProjectSlugs.includes(project.slug),
  );

  return (
    <div>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
            { name: service.name, path: `/services/${service.slug}` },
          ]),
          serviceSchema(service),
        ]}
      />

      <Link href="/services" className="text-sm text-muted hover:text-accent">
        ← Services
      </Link>

      <Reveal className="mt-6">
        <Eyebrow>{service.category}</Eyebrow>
        <h1 className="mt-2 text-3xl font-semibold text-foreground sm:text-4xl">
          {service.headline}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{service.summary}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/contact"
            className="rounded-md bg-accent px-5 py-3 text-sm font-medium text-background hover:opacity-90"
          >
            {service.cta}
          </Link>
          <Link
            href={service.relatedHref.href}
            className="rounded-md border border-border px-5 py-3 text-sm text-foreground hover:border-accent hover:text-accent"
          >
            {service.relatedHref.label}
          </Link>
        </div>
      </Reveal>

      <Reveal className="mt-12" delay={0.05}>
        <h2 className="font-mono text-xs uppercase tracking-wider text-accent">Who this is for</h2>
        <ul className="mt-4 flex max-w-2xl flex-col gap-2">
          {service.whoFor.map((item) => (
            <li key={item} className="text-base leading-relaxed text-muted">
              <span className="mr-2 text-accent">›</span>
              {item}
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal className="mt-12" delay={0.05}>
        <h2 className="font-mono text-xs uppercase tracking-wider text-accent">Capabilities</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {service.capabilities.map((item) => (
            <Chip key={item}>{item}</Chip>
          ))}
        </div>
      </Reveal>

      <section className="mt-12">
        <h2 className="font-mono text-xs uppercase tracking-wider text-accent">How engagements run</h2>
        <RevealGroup className="mt-4 grid gap-4 sm:grid-cols-2" stagger={0.06}>
          {service.process.map((step, index) => (
            <RevealItem key={step.title}>
              <div className="h-full rounded-lg border border-border bg-surface p-5">
                <p className="font-mono text-xs text-muted">{String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-2 text-lg font-medium text-foreground">{step.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-muted">{step.description}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      <RevealGroup className="mt-12 grid gap-4 sm:grid-cols-2" stagger={0.06}>
        <RevealItem>
          <div className="h-full rounded-lg border border-border bg-surface p-5">
            <h2 className="font-mono text-xs uppercase tracking-wider text-accent">Good fit</h2>
            <ul className="mt-4 flex flex-col gap-2">
              {service.fit.map((item) => (
                <li key={item} className="text-sm leading-relaxed text-muted">
                  <span className="mr-2 text-accent">›</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </RevealItem>
        <RevealItem>
          <div className="h-full rounded-lg border border-border bg-surface p-5">
            <h2 className="font-mono text-xs uppercase tracking-wider text-muted">Not a fit</h2>
            <ul className="mt-4 flex flex-col gap-2">
              {service.notAFit.map((item) => (
                <li key={item} className="text-sm leading-relaxed text-muted">
                  <span className="mr-2 text-muted">›</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </RevealItem>
      </RevealGroup>

      {relatedProjects.length > 0 && (
        <section className="mt-12">
          <h2 className="font-mono text-xs uppercase tracking-wider text-accent">
            Related work
          </h2>
          <RevealGroup className="mt-4 grid gap-4 sm:grid-cols-2" stagger={0.06}>
            {relatedProjects.map((project) => (
              <RevealItem key={project.slug}>
                <Link
                  href={`/work/${project.slug}`}
                  className="group block h-full rounded-lg border border-border bg-surface p-5 transition-colors hover:border-accent/60"
                >
                  <h3 className="text-lg font-medium text-foreground group-hover:text-accent">
                    {project.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{project.summary}</p>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>
      )}

      <Reveal className="mt-12" delay={0.05}>
        <div className="rounded-lg border border-accent/30 bg-accent/5 p-6">
          <h2 className="text-lg font-medium text-foreground">Ready to talk through a problem?</h2>
          <p className="mt-2 max-w-2xl text-base text-muted">
            Share the product context, constraints, and what success looks like. I reply to selected
            engagements that are a clear fit.
          </p>
          <Link
            href="/contact"
            className="mt-4 inline-block rounded-md bg-accent px-5 py-3 text-sm font-medium text-background hover:opacity-90"
          >
            {service.cta}
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
