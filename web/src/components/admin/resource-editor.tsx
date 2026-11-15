"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { slugify } from "@/lib/posts";
import {
  suggestedResourceKinds,
  type Resource,
  type ResourceLevel,
  type ResourceStatus,
} from "@/lib/resources";

export function ResourceEditor({ resource }: { resource?: Resource }) {
  const router = useRouter();
  const [title, setTitle] = useState(resource?.title ?? "");
  const [slug, setSlug] = useState(resource?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(resource));
  const [kind, setKind] = useState(resource?.kind ?? "");
  const [summary, setSummary] = useState(resource?.summary ?? "");
  const [body, setBody] = useState(resource?.body ?? "");
  const [level, setLevel] = useState<ResourceLevel>(resource?.level ?? "intermediate");
  const [topics, setTopics] = useState(resource?.topics?.join(", ") ?? "");
  const [href, setHref] = useState(resource?.href ?? "");
  const [coverImage, setCoverImage] = useState(resource?.cover_image ?? "");
  const [sortOrder, setSortOrder] = useState(resource?.sort_order ?? 0);
  const [status, setStatus] = useState<ResourceStatus>(resource?.status ?? "draft");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleSave(nextStatus: ResourceStatus) {
    if (!supabase) return;
    if (!title.trim() || !kind.trim() || !slug.trim()) {
      setError("Title, kind, and slug are required.");
      return;
    }

    setSaving(true);
    setError(null);
    setStatus(nextStatus);

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      kind: kind.trim().toLowerCase(),
      summary: summary.trim(),
      body: body.trim() || null,
      level,
      topics: topics
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      href: href.trim() || null,
      cover_image: coverImage.trim() || null,
      sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
      status: nextStatus,
      updated_at: new Date().toISOString(),
    };

    const { error: saveError } = resource
      ? await supabase.from("resources").update(payload).eq("id", resource.id)
      : await supabase.from("resources").insert(payload);

    setSaving(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }

    router.push("/admin/resources");
    router.refresh();
  }

  async function handleDelete() {
    if (!supabase || !resource) return;
    if (!confirm("Delete this resource?")) return;
    const { error: deleteError } = await supabase.from("resources").delete().eq("id", resource.id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    router.push("/admin/resources");
    router.refresh();
  }

  return (
    <div className="flex max-w-3xl flex-col gap-5">
      <label className="flex flex-col gap-1.5 text-sm text-muted">
        Title
        <input
          value={title}
          onChange={(event) => handleTitleChange(event.target.value)}
          className="rounded-md border border-border bg-background px-3 py-2 text-foreground"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm text-muted">
          Slug
          <input
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(event.target.value);
            }}
            className="rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-foreground"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted">
          Kind
          <input
            list="resource-kinds"
            value={kind}
            onChange={(event) => setKind(event.target.value)}
            placeholder="book, video, tool, or anything else"
            className="rounded-md border border-border bg-background px-3 py-2 text-foreground"
          />
          <datalist id="resource-kinds">
            {suggestedResourceKinds.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        </label>
      </div>

      <p className="text-xs text-muted">
        Kind is freeform. Use suggestions or type your own (newsletter, dataset, workshop…).
      </p>

      <label className="flex flex-col gap-1.5 text-sm text-muted">
        Summary
        <textarea
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          rows={3}
          className="rounded-md border border-border bg-background px-3 py-2 text-foreground"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm text-muted">
        Body (optional Markdown)
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={8}
          className="rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-foreground"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1.5 text-sm text-muted">
          Level
          <select
            value={level}
            onChange={(event) => setLevel(event.target.value as ResourceLevel)}
            className="rounded-md border border-border bg-background px-3 py-2 text-foreground"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="all">All levels</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted">
          Sort order
          <input
            type="number"
            value={sortOrder}
            onChange={(event) => setSortOrder(Number(event.target.value))}
            className="rounded-md border border-border bg-background px-3 py-2 text-foreground"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted">
          Status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as ResourceStatus)}
            className="rounded-md border border-border bg-background px-3 py-2 text-foreground"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1.5 text-sm text-muted">
        Topics (comma separated)
        <input
          value={topics}
          onChange={(event) => setTopics(event.target.value)}
          placeholder="architecture, git, ai"
          className="rounded-md border border-border bg-background px-3 py-2 text-foreground"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm text-muted">
        External link (optional)
        <input
          value={href}
          onChange={(event) => setHref(event.target.value)}
          placeholder="https://…"
          className="rounded-md border border-border bg-background px-3 py-2 text-foreground"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm text-muted">
        Cover image URL (optional)
        <input
          value={coverImage}
          onChange={(event) => setCoverImage(event.target.value)}
          placeholder="https://…"
          className="rounded-md border border-border bg-background px-3 py-2 text-foreground"
        />
      </label>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={saving}
          onClick={() => void handleSave("draft")}
          className="rounded-md border border-border px-4 py-2 text-sm text-foreground hover:border-accent hover:text-accent disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save draft"}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => void handleSave("published")}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Publish"}
        </button>
        {resource && (
          <button
            type="button"
            onClick={() => void handleDelete()}
            className="rounded-md border border-red-500/40 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
