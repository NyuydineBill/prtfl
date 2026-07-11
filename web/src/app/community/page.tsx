import Image from "next/image";
import { GraduationCap, Users, Award, Sparkles } from "lucide-react";
import { teaching } from "@/lib/data/teaching";
import { leadership } from "@/lib/data/leadership";
import { certifications } from "@/lib/data/certifications";
import { SectionHeading, Chip } from "@/components/ui";
import { Timeline, TimelineItem } from "@/components/timeline";
import { OrgBadge } from "@/components/org-badge";
import { Gallery } from "@/components/gallery";
import { Reveal, RevealGroup, RevealItem } from "@/components/reveal";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Community",
  description:
    "Teaching, mentorship, and leadership work: IT instruction, tutoring, and leading the Microsoft Learn Student Ambassadors chapter at the University of Bamenda.",
  path: "/community",
});

export default function CommunityPage() {
  const featuredCert = certifications.find((c) => c.featured);
  const otherCerts = certifications.filter((c) => !c.featured);

  return (
    <div className="flex flex-col gap-14 sm:gap-20 lg:gap-24">
      <SectionHeading
        index={1}
        eyebrow="Beyond the code"
        title="Teaching, leadership & community"
        description="Software is most of what I do, but not all of it. I tutor, I've trained people on the ground, and I've led a technical community. The same instinct to explain systems clearly shows up in all three."
      />

      {/* Teaching */}
      <section>
        <div className="mb-8 flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-accent" />
          <h2 className="font-mono text-xs uppercase tracking-wider text-accent">
            Teaching experience
          </h2>
        </div>
        <Timeline>
          {teaching.map((entry, index) => (
            <TimelineItem key={entry.role + entry.org} icon={GraduationCap} delay={index * 0.05}>
              <div className="flex items-start gap-3">
                <OrgBadge name={entry.org} logoSrc={entry.logo} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-medium text-foreground">
                      {entry.role} · {entry.org}
                    </h3>
                    <span className="font-mono text-xs text-muted">{entry.period}</span>
                  </div>
                  <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted">
                    {entry.summary}
                  </p>
                  <ul className="mt-3 flex max-w-2xl flex-col gap-2">
                    {entry.responsibilities.map((point) => (
                      <li key={point} className="text-base leading-relaxed text-muted">
                        <span className="mr-2 text-accent">›</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {entry.skills.map((skill) => (
                      <Chip key={skill}>{skill}</Chip>
                    ))}
                  </div>
                  <Gallery photos={entry.photos} alt={`${entry.role} at ${entry.org}`} />
                </div>
              </div>
            </TimelineItem>
          ))}
        </Timeline>
      </section>

      {/* Leadership */}
      <section>
        <div className="mb-8 flex items-center gap-2">
          <Users className="h-4 w-4 text-accent" />
          <h2 className="font-mono text-xs uppercase tracking-wider text-accent">
            Leadership & community
          </h2>
        </div>
        <RevealGroup className="flex flex-col gap-4">
          {leadership.map((entry) => (
            <RevealItem key={entry.role}>
              <div className="flex items-start gap-3 rounded-lg border border-border bg-surface p-6">
                <OrgBadge name={entry.org} logoSrc={entry.logo} />
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-foreground">{entry.role}</h3>
                  <p className="text-sm text-muted">
                    {entry.org} · {entry.institution}
                  </p>
                  <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted">
                    {entry.summary}
                  </p>
                  <ul className="mt-3 flex max-w-2xl flex-col gap-2">
                    {entry.responsibilities.map((point) => (
                      <li key={point} className="text-base leading-relaxed text-muted">
                        <span className="mr-2 text-accent">›</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {entry.skills.map((skill) => (
                      <Chip key={skill}>{skill}</Chip>
                    ))}
                  </div>
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* Certifications */}
      <section>
        <div className="mb-8 flex items-center gap-2">
          <Award className="h-4 w-4 text-accent" />
          <h2 className="font-mono text-xs uppercase tracking-wider text-accent">
            Certifications & professional development
          </h2>
        </div>

        {featuredCert && (
          <Reveal>
            <div className="relative overflow-hidden rounded-lg border border-gold/40 bg-surface p-6">
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-md border border-gold/40 bg-gold/10 px-2.5 py-1 font-mono text-xs text-gold">
                <Sparkles className="h-3 w-3" />
                Featured certification
              </div>
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-medium text-foreground">{featuredCert.name}</h3>
                  <p className="text-sm text-muted">
                    {featuredCert.org} · {featuredCert.period}
                  </p>
                  {featuredCert.summary && (
                    <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
                      {featuredCert.summary}
                    </p>
                  )}
                  {featuredCert.skills && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {featuredCert.skills.map((skill) => (
                        <Chip key={skill}>{skill}</Chip>
                      ))}
                    </div>
                  )}
                </div>
                {featuredCert.certificateImage && (
                  <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-md border border-border sm:w-56">
                    <Image
                      src={featuredCert.certificateImage}
                      alt={`${featuredCert.name} certificate`}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        )}

        {otherCerts.length > 0 && (
          <RevealGroup className="mt-4 grid gap-4 sm:grid-cols-2" stagger={0.06}>
            {otherCerts.map((cert) => (
              <RevealItem key={cert.name}>
                <div className="flex items-start gap-3 rounded-lg border border-border bg-surface p-5">
                  <OrgBadge name={cert.org} />
                  <div>
                    <h3 className="font-medium text-foreground">{cert.name}</h3>
                    <p className="text-sm text-muted">
                      {cert.org} · {cert.period}
                    </p>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </section>
    </div>
  );
}
