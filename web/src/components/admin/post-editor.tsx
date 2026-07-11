"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import { slugify, type Post } from "@/lib/posts";

const COVER_BUCKET = "post-images";

export function PostEditor({ post }: { post?: Post }) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [tags, setTags] = useState(post?.tags?.join(", ") ?? "");
  const [coverImage, setCoverImage] = useState(post?.cover_image ?? "");
  const [status, setStatus] = useState<"draft" | "published">(post?.status ?? "draft");
  const [aiGenerated, setAiGenerated] = useState(post?.ai_generated ?? false);

  const [topic, setTopic] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleCoverUpload(file: File) {
    if (!supabase) return;
    setUploading(true);
    setUploadError(null);

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage.from(COVER_BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) {
      setUploadError(error.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from(COVER_BUCKET).getPublicUrl(path);
    setCoverImage(data.publicUrl);
    setUploading(false);
  }

  async function handleGenerate() {
    if (!topic.trim()) return;
    setGenerating(true);
    setGenError(null);
    try {
      const res = await fetch("/api/admin/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Generation failed");
      }
      const draft = await res.json();
      setTitle(draft.title);
      if (!slugTouched) setSlug(slugify(draft.title));
      setExcerpt(draft.excerpt);
      setContent(draft.content);
      setAiGenerated(true);
    } catch (err) {
      setGenError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave(nextStatus: "draft" | "published") {
    if (!supabase) return;
    setSaving(true);
    setSaveError(null);

    const tagArray = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title,
      slug,
      excerpt: excerpt || null,
      content,
      cover_image: coverImage || null,
      tags: tagArray,
      status: nextStatus,
      ai_generated: aiGenerated,
      updated_at: new Date().toISOString(),
      ...(nextStatus === "published" && !post?.published_at
        ? { published_at: new Date().toISOString() }
        : {}),
    };

    const { error } = post
      ? await supabase.from("posts").update(payload).eq("id", post.id)
      : await supabase.from("posts").insert(payload);

    setSaving(false);

    if (error) {
      setSaveError(error.message);
      return;
    }

    if (nextStatus === "published" && post?.status !== "published") {
      fetch("/api/admin/notify-subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug, excerpt }),
      }).catch(() => {});
    }

    setStatus(nextStatus);
    router.push("/admin");
    router.refresh();
  }

  async function handleDelete() {
    if (!supabase || !post) return;
    if (!confirm("Delete this post? This can't be undone.")) return;
    await supabase.from("posts").delete().eq("id", post.id);
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-lg border border-accent/30 bg-accent/5 p-5">
        <h2 className="font-mono text-xs uppercase tracking-wider text-accent">
          Generate with AI
        </h2>
        <p className="mt-2 text-sm text-muted">
          Give it a topic or a few bullet points. It drafts title, excerpt, and content below for
          you to review and edit before publishing.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Why I architect AI services as separate microservices"
            className="flex-1 rounded-md border border-border bg-surface px-3 py-2.5 text-base text-foreground outline-none focus:border-accent"
          />
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating || !topic.trim()}
            className="shrink-0 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generating ? "Generating…" : "Generate draft"}
          </button>
        </div>
        {genError && <p className="mt-2 text-sm text-red-400">{genError}</p>}
      </div>

      <div className="flex flex-col gap-4">
        <Field label="Title" value={title} onChange={handleTitleChange} />
        <Field
          label="Slug"
          value={slug}
          onChange={(v) => {
            setSlugTouched(true);
            setSlug(v);
          }}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted">Excerpt</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            className="rounded-md border border-border bg-surface px-3 py-2.5 text-base text-foreground outline-none focus:border-accent"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted">Content (Markdown)</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={16}
            className="rounded-md border border-border bg-surface px-3 py-2.5 font-mono text-sm text-foreground outline-none focus:border-accent"
          />
        </div>
        <Field label="Tags (comma-separated)" value={tags} onChange={setTags} />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted">Cover image</label>
          <div className="flex items-start gap-4">
            {coverImage && (
              <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-md border border-border">
                <Image src={coverImage} alt="Cover preview" fill className="object-cover" />
              </div>
            )}
            <div className="flex flex-1 flex-col gap-2">
              <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-foreground hover:border-accent hover:text-accent">
                {uploading ? "Uploading…" : "Upload image"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleCoverUpload(file);
                    e.target.value = "";
                  }}
                />
              </label>
              <input
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="Or paste an image URL"
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
              />
              {uploadError && <p className="text-sm text-red-400">{uploadError}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
        <button
          type="button"
          onClick={() => handleSave("draft")}
          disabled={saving || !title || !content}
          className="rounded-md border border-border px-4 py-2.5 text-sm text-foreground hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save draft
        </button>
        <button
          type="button"
          onClick={() => handleSave("published")}
          disabled={saving || !title || !content}
          className="rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "published" ? "Update & keep published" : "Publish"}
        </button>
        {post && (
          <button
            type="button"
            onClick={handleDelete}
            className="ml-auto rounded-md border border-red-400/40 px-4 py-2.5 text-sm text-red-400 hover:bg-red-400/10"
          >
            Delete
          </button>
        )}
      </div>
      {saveError && <p className="text-sm text-red-400">{saveError}</p>}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-muted">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-border bg-surface px-3 py-2.5 text-base text-foreground outline-none focus:border-accent"
      />
    </div>
  );
}
