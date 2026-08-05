import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { services } from "@/lib/data/services";
import { SectionHeading, Eyebrow } from "@/components/ui";
import { Reveal, RevealGroup, RevealItem } from "@/components/reveal";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema, serviceSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Services",
  description:
    "Remote engineering services: AI product engineering, full-stack development, software architecture consulting, and engineering mentoring.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <div>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
          ]),
          ...services.map((service) => serviceSchema(service)),
        ]}
      />

      <Reveal>
        <SectionHeading
          as="h1"
          index={1}
          eyebrow="Engagements"
          title="How we can work together"
          description="Select remote engagements across AI products, full-stack delivery, architecture consulting, and mentoring—grounded in systems already shipped."
        />
      </Reveal>

      <RevealGroup className="grid gap-4 sm:grid-cols-2" stagger={0.06}>
        {services.map((service) => (
          <RevealItem key={service.slug}>
            <Link
              href={`/services/${service.slug}`}
              className="group flex h-full flex-col rounded-lg border border-border bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 hover:shadow-[0_0_30px_-12px_var(--color-accent)]"
            >
              <Eyebrow>{service.category}</Eyebrow>
              <h2 className="mt-2 flex items-center gap-1.5 text-xl font-medium text-foreground group-hover:text-accent">
                {service.name}
                <ArrowRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
              </h2>
              <p className="mt-3 text-base leading-relaxed text-muted">{service.description}</p>
              <p className="mt-4 font-mono text-xs text-accent">{service.cta} →</p>
            </Link>
          </RevealItem>
        ))}
      </RevealGroup>

      <Reveal className="mt-10 sm:mt-14" delay={0.08}>
        <div className="rounded-lg border border-border bg-surface p-6">
          <h2 className="text-lg font-medium text-foreground">Prefer to start with context?</h2>
          <p className="mt-2 max-w-2xl text-base text-muted">
            Browse case studies on the work page, then reach out with the problem you want solved.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/work"
              className="rounded-md border border-border px-4 py-2 text-sm text-foreground hover:border-accent hover:text-accent"
            >
              View work
            </Link>
            <Link
              href="/contact"
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-background hover:opacity-90"
            >
              Contact
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
