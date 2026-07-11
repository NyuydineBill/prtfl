"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { SectionHeading } from "@/components/ui";

type Subscriber = { id: string; email: string; created_at: string };

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[] | null>(null);

  async function load() {
    if (!supabase) return;
    const { data } = await supabase
      .from("subscribers")
      .select("id, email, created_at")
      .order("created_at", { ascending: false });
    setSubscribers(data ?? []);
  }

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("subscribers")
      .select("id, email, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setSubscribers(data ?? []);
      });
  }, []);

  async function remove(id: string) {
    if (!supabase) return;
    if (!confirm("Remove this subscriber?")) return;
    await supabase.from("subscribers").delete().eq("id", id);
    load();
  }

  return (
    <div>
      <SectionHeading
        eyebrow="Articles"
        title="Subscribers"
        description={
          subscribers ? `${subscribers.length} subscriber${subscribers.length === 1 ? "" : "s"}.` : undefined
        }
      />
      <p className="mb-6 max-w-xl text-sm text-muted">
        Everyone on this list gets a short email automatically the first time you publish a new
        article, via the SMTP relay configured in the environment.
      </p>
      <div className="flex flex-col divide-y divide-border rounded-lg border border-border bg-surface">
        {subscribers?.length === 0 && (
          <p className="p-4 text-base text-muted">No subscribers yet.</p>
        )}
        {subscribers?.map((s) => (
          <div key={s.id} className="flex items-center justify-between gap-3 p-4">
            <div>
              <p className="text-sm text-foreground">{s.email}</p>
              <p className="text-xs text-muted">{new Date(s.created_at).toLocaleDateString()}</p>
            </div>
            <button
              type="button"
              onClick={() => remove(s.id)}
              className="text-sm text-red-400 hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
