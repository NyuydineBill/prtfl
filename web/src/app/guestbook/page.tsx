import { createClient } from "@/lib/supabase/server";
import type { GuestbookEntry } from "@/lib/guestbook";
import { SectionHeading } from "@/components/ui";
import { Reveal, RevealGroup, RevealItem } from "@/components/reveal";
import { GuestbookForm } from "@/components/guestbook-form";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Guestbook",
  description: "Leave a note or read what visitors and collaborators have shared.",
  path: "/guestbook",
});
export const dynamic = "force-dynamic";

export default async function GuestbookPage() {
  const supabase = await createClient();
  const { data: entries } = supabase
    ? await supabase
        .from("guestbook")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
    : { data: null as GuestbookEntry[] | null };

  return (
    <div>
      <Reveal>
        <SectionHeading
          index={1}
          eyebrow="Guestbook"
          title="Leave a note"
          description="Worked together, or just visiting? Leave a note — it shows up here once I've had a look."
        />
        <GuestbookForm />
      </Reveal>

      <div className="mt-10 sm:mt-16">
        <h2 className="font-mono text-xs uppercase tracking-wider text-accent">
          Notes
        </h2>
        {!entries || entries.length === 0 ? (
          <p className="mt-4 text-base text-muted">No notes yet — be the first.</p>
        ) : (
          <RevealGroup className="mt-4 grid gap-4 sm:grid-cols-2" stagger={0.06}>
            {entries.map((entry) => (
              <RevealItem key={entry.id}>
                <div className="h-full rounded-lg border border-border bg-surface p-5">
                  <p className="text-sm leading-relaxed text-muted">{entry.message}</p>
                  <div className="mt-3 flex items-baseline justify-between gap-2 border-t border-border pt-3">
                    <span className="text-sm font-medium text-foreground">{entry.name}</span>
                    {entry.role && <span className="text-xs text-muted">{entry.role}</span>}
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </div>
    </div>
  );
}
