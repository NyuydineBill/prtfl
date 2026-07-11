"use client";

import { useState } from "react";

export function GuestbookForm() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/guestbook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), role: role.trim(), message: message.trim() }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Something went wrong");
      return;
    }

    setName("");
    setRole("");
    setMessage("");
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <p className="rounded-lg border border-border bg-surface p-5 text-base text-muted">
        Thanks — your note is in and will show up once it&rsquo;s reviewed.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          required
          className="rounded-md border border-border bg-surface px-3 py-2.5 text-base text-foreground outline-none focus:border-accent"
        />
        <input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Role / company (optional)"
          className="rounded-md border border-border bg-surface px-3 py-2.5 text-base text-foreground outline-none focus:border-accent"
        />
      </div>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Leave a note…"
        rows={3}
        required
        className="rounded-md border border-border bg-surface px-3 py-2.5 text-base text-foreground outline-none focus:border-accent"
      />
      <button
        type="submit"
        disabled={submitting}
        className="self-start rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Posting…" : "Sign the guestbook"}
      </button>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </form>
  );
}
