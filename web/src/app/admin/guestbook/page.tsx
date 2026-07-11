"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { SectionHeading } from "@/components/ui";
import type { GuestbookEntry } from "@/lib/guestbook";

export default function AdminGuestbookPage() {
  const [entries, setEntries] = useState<GuestbookEntry[] | null>(null);

  async function load() {
    if (!supabase) return;
    const { data } = await supabase
      .from("guestbook")
      .select("*")
      .order("created_at", { ascending: false });
    setEntries(data ?? []);
  }

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("guestbook")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setEntries(data ?? []);
      });
  }, []);

  async function approve(id: string) {
    if (!supabase) return;
    await supabase.from("guestbook").update({ status: "approved" }).eq("id", id);
    load();
  }

  async function remove(id: string) {
    if (!supabase) return;
    if (!confirm("Delete this entry?")) return;
    await supabase.from("guestbook").delete().eq("id", id);
    load();
  }

  return (
    <div>
      <SectionHeading eyebrow="Moderation" title="Guestbook" />
      <div className="flex flex-col gap-3">
        {entries?.length === 0 && <p className="text-base text-muted">No entries yet.</p>}
        {entries?.map((entry) => (
          <div key={entry.id} className="rounded-lg border border-border bg-surface p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-sm font-medium text-foreground">
                {entry.name}
                {entry.role && <span className="ml-2 text-xs text-muted">{entry.role}</span>}
              </span>
              <span
                className={`rounded-md border px-2 py-0.5 font-mono text-xs ${
                  entry.status === "approved"
                    ? "border-positive/40 text-positive"
                    : "border-border text-muted"
                }`}
              >
                {entry.status}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">{entry.message}</p>
            <div className="mt-3 flex gap-3 border-t border-border pt-3">
              {entry.status === "pending" && (
                <button
                  type="button"
                  onClick={() => approve(entry.id)}
                  className="text-sm text-accent hover:underline"
                >
                  Approve
                </button>
              )}
              <button
                type="button"
                onClick={() => remove(entry.id)}
                className="text-sm text-red-400 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
