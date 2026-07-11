"use client";

import { useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) {
      setStatus("error");
      return;
    }

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      subject: String(data.get("subject") ?? ""),
      message: String(data.get("message") ?? ""),
    };

    setStatus("submitting");
    const { error } = await supabase.from("messages").insert(payload);

    if (error) {
      setStatus("error");
      return;
    }

    setStatus("success");
    form.reset();
  }

  if (status === "success") {
    return (
      <p className="rounded-lg border border-border bg-surface p-5 text-base text-muted">
        Thanks. Your message is in, I&rsquo;ll get back to you soon.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" name="name" required />
        <Field label="Your email" name="email" type="email" required />
      </div>
      <Field label="Subject" name="subject" />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-xs text-muted">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className="rounded-md border border-border bg-surface px-3 py-2.5 text-base text-foreground outline-none focus:border-accent"
        />
      </div>

      <button
        type="submit"
        disabled={status === "submitting" || !isSupabaseConfigured}
        className="mt-2 self-start rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "submitting" ? "Sending…" : "Send message"}
      </button>

      {!isSupabaseConfigured && (
        <p className="text-xs text-muted">
          The contact form isn&rsquo;t wired up to a backend yet, so email me directly in the meantime.
        </p>
      )}
      {status === "error" && isSupabaseConfigured && (
        <p className="text-xs text-red-400">
          Something went wrong sending that. Try again or email me directly.
        </p>
      )}
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-xs text-muted">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="rounded-md border border-border bg-surface px-3 py-2.5 text-base text-foreground outline-none focus:border-accent"
      />
    </div>
  );
}
