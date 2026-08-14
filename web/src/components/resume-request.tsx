"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { Download, X } from "lucide-react";

type Status = "idle" | "submitting" | "success" | "error";

export function ResumeRequestButton({
  className = "",
  label = "Download résumé",
  onOpen,
}: {
  className?: string;
  label?: string;
  onOpen?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          onOpen?.();
          setOpen(true);
        }}
        className={className}
      >
        {label.includes("Download") || label.includes("résumé") ? (
          <span className="inline-flex items-center gap-2">
            <Download className="h-3.5 w-3.5" />
            {label}
          </span>
        ) : (
          label
        )}
      </button>
      {open && <ResumeRequestModal onClose={() => setOpen(false)} />}
    </>
  );
}

function ResumeRequestModal({ onClose }: { onClose: () => void }) {
  const titleId = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [website, setWebsite] = useState("");

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setStatus("submitting");
    setError(null);

    const res = await fetch("/api/resume-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(data.get("name") ?? "").trim(),
        email: String(data.get("email") ?? "").trim(),
        company: String(data.get("company") ?? "").trim(),
        role: String(data.get("role") ?? "").trim(),
        message: String(data.get("message") ?? "").trim(),
        website,
      }),
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      setStatus("error");
      setError(typeof body.error === "string" ? body.error : "Something went wrong");
      return;
    }

    setStatus("success");
    form.reset();
    setWebsite("");
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-background/80 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-border bg-surface p-5 shadow-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-foreground">
              Request résumé
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Share a few details and I&rsquo;ll send the résumé by email if it&rsquo;s a good fit.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md border border-border p-2 text-muted hover:border-accent hover:text-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {status === "success" ? (
          <div className="mt-6 rounded-lg border border-border bg-background p-4">
            <p className="text-sm leading-relaxed text-muted">
              Thanks. Your request is in. I&rsquo;ll review it and follow up by email.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 rounded-md bg-accent px-4 py-2 text-sm font-medium text-background hover:opacity-90"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Your name" name="name" required />
              <Field label="Your email" name="email" type="email" required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Company / organization" name="company" />
              <Field label="Your role" name="role" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="resume-message" className="text-xs text-muted">
                Why are you requesting it? (optional)
              </label>
              <textarea
                id="resume-message"
                name="message"
                rows={3}
                maxLength={1000}
                placeholder="Hiring for a role, collaboration idea, etc."
                className="rounded-md border border-border bg-background px-3 py-2.5 text-base text-foreground outline-none focus:border-accent"
              />
            </div>

            <div className="absolute -left-[10000px]" aria-hidden="true">
              <label htmlFor="resume-website">Website</label>
              <input
                id="resume-website"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
                autoComplete="off"
                tabIndex={-1}
              />
            </div>

            <button
              type="submit"
              disabled={status === "submitting"}
              className="mt-1 self-start rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "submitting" ? "Sending request…" : "Request résumé"}
            </button>

            {error && (
              <p role="alert" className="text-sm text-red-400">
                {error}
              </p>
            )}
          </form>
        )}
      </div>
    </div>,
    document.body,
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
  const id = `resume-${name}`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs text-muted">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        autoComplete={name === "email" ? "email" : name === "name" ? "name" : "organization"}
        className="rounded-md border border-border bg-background px-3 py-2.5 text-base text-foreground outline-none focus:border-accent"
      />
    </div>
  );
}
