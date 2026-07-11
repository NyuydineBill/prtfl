import { profile } from "@/lib/data/profile";
import { SectionHeading } from "@/components/ui";
import { ContactForm } from "@/components/contact-form";
import { Reveal } from "@/components/reveal";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Contact",
  description: `Get in touch with ${profile.name} for engineering engagements, collaborations, or questions.`,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div>
      <Reveal>
        <SectionHeading
          index={1}
          eyebrow="Get in touch"
          title="Contact"
          description="Open to select engagements and interesting problems. The fastest way to reach me is email."
        />

        <div className="mb-10 flex flex-wrap gap-3">
          <a
            href={`mailto:${profile.email}`}
            className="rounded-md border border-border px-4 py-2 text-sm text-foreground transition-colors hover:border-accent hover:text-accent"
          >
            {profile.email}
          </a>
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-border px-4 py-2 text-sm text-foreground transition-colors hover:border-accent hover:text-accent"
          >
            GitHub
          </a>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-border px-4 py-2 text-sm text-foreground transition-colors hover:border-accent hover:text-accent"
          >
            LinkedIn
          </a>
        </div>

        <ContactForm />
      </Reveal>
    </div>
  );
}
