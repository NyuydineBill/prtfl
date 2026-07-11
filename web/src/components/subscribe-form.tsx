"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "duplicate" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !email.trim()) return;
    setSubmitting(true);
    setStatus("idle");

    const { error } = await supabase.from("subscribers").insert({ email: email.trim() });

    setSubmitting(false);

    if (error) {
      setStatus(error.code === "23505" ? "duplicate" : "error");
      return;
    }

    setEmail("");
    setStatus("success");
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <h2 className="font-mono text-xs uppercase tracking-wider text-accent">
        Get notified
      </h2>
      <p className="mt-2 text-sm text-muted">
        A short email whenever I publish something new. No spam, unsubscribe anytime.
      </p>
      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="flex-1 rounded-md border border-border bg-surface-high px-3 py-2.5 text-base text-foreground outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={submitting}
          className="shrink-0 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Subscribing…" : "Subscribe"}
        </button>
      </form>
      {status === "success" && (
        <p className="mt-2 text-sm text-positive">You&rsquo;re on the list.</p>
      )}
      {status === "duplicate" && (
        <p className="mt-2 text-sm text-muted">That email&rsquo;s already subscribed.</p>
      )}
      {status === "error" && (
        <p className="mt-2 text-sm text-red-400">Something went wrong — try again.</p>
      )}
    </div>
  );
}
