"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { articleClusters, articleTopics } from "@/lib/data/article-topics";
import { SectionHeading } from "@/components/ui";

type JobResult = {
  id: string;
  title: string;
  ok: boolean;
  message: string;
  slug?: string;
};

export default function AdminGeneratePage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [clusterFilter, setClusterFilter] = useState("All");
  const [generateImage, setGenerateImage] = useState(true);
  const [mode, setMode] = useState<"draft" | "now" | "schedule">("schedule");
  const [scheduleStart, setScheduleStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  });
  const [perDay, setPerDay] = useState(1);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<JobResult[]>([]);

  const visible = useMemo(
    () =>
      articleTopics.filter(
        (topic) => clusterFilter === "All" || topic.cluster === clusterFilter,
      ),
    [clusterFilter],
  );

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function selectVisible() {
    setSelected(visible.map((topic) => topic.id));
  }

  async function runBatch() {
    if (selected.length === 0) return;
    setRunning(true);
    setResults([]);

    const start = new Date(scheduleStart);

    for (const [index, id] of selected.entries()) {
      const topic = articleTopics.find((item) => item.id === id);
      if (!topic) continue;

      const publishAt = new Date(start);
      publishAt.setDate(start.getDate() + Math.floor(index / Math.max(perDay, 1)));

      try {
        const res = await fetch("/api/admin/generate-post", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topicId: id,
            generateImage,
            save: true,
            publish: mode === "now",
            publishAt: mode === "schedule" ? publishAt.toISOString() : undefined,
          }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          setResults((current) => [
            ...current,
            {
              id,
              title: topic.title,
              ok: false,
              message: body.error ?? "Generation failed",
            },
          ]);
          continue;
        }

        const when =
          mode === "schedule"
            ? `Scheduled ${publishAt.toLocaleString()}`
            : mode === "now"
              ? "Published now"
              : "Saved as draft";

        setResults((current) => [
          ...current,
          {
            id,
            title: body.saved?.title ?? body.title ?? topic.title,
            ok: true,
            message: when,
            slug: body.saved?.slug,
          },
        ]);
      } catch (err) {
        setResults((current) => [
          ...current,
          {
            id,
            title: topic.title,
            ok: false,
            message: err instanceof Error ? err.message : "Generation failed",
          },
        ]);
      }
    }

    setRunning(false);
  }

  return (
    <div>
      <SectionHeading
        as="h1"
        eyebrow="Content engine"
        title="Generate articles"
        description={`${articleTopics.length} curated SEO topics across ${articleClusters.length} clusters. Generate useful drafts with optional cover images, then review before bulk-publishing hundreds.`}
      />

      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface p-4">
        <label className="text-sm text-muted">
          Cluster{" "}
          <select
            value={clusterFilter}
            onChange={(event) => setClusterFilter(event.target.value)}
            className="ml-2 rounded-md border border-border bg-background px-2 py-1.5 text-foreground"
          >
            <option value="All">All</option>
            {articleClusters.map((cluster) => (
              <option key={cluster} value={cluster}>
                {cluster}
              </option>
            ))}
          </select>
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={generateImage}
            onChange={(event) => setGenerateImage(event.target.checked)}
          />
          Photo cover (Unsplash, no AI image API)
        </label>
        <label className="text-sm text-muted">
          Mode{" "}
          <select
            value={mode}
            onChange={(event) => setMode(event.target.value as typeof mode)}
            className="ml-2 rounded-md border border-border bg-background px-2 py-1.5 text-foreground"
          >
            <option value="schedule">Schedule (staggered)</option>
            <option value="draft">Draft only</option>
            <option value="now">Publish now</option>
          </select>
        </label>
        {mode === "schedule" && (
          <>
            <label className="text-sm text-muted">
              Start{" "}
              <input
                type="datetime-local"
                value={scheduleStart}
                onChange={(event) => setScheduleStart(event.target.value)}
                className="ml-2 rounded-md border border-border bg-background px-2 py-1.5 text-foreground"
              />
            </label>
            <label className="text-sm text-muted">
              Per day{" "}
              <input
                type="number"
                min={1}
                max={5}
                value={perDay}
                onChange={(event) => setPerDay(Number(event.target.value) || 1)}
                className="ml-2 w-16 rounded-md border border-border bg-background px-2 py-1.5 text-foreground"
              />
            </label>
          </>
        )}
        <button
          type="button"
          onClick={selectVisible}
          className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground hover:border-accent hover:text-accent"
        >
          Select visible ({visible.length})
        </button>
        <button
          type="button"
          onClick={() => setSelected([])}
          className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground hover:border-accent hover:text-accent"
        >
          Clear
        </button>
        <button
          type="button"
          disabled={running || selected.length === 0}
          onClick={() => void runBatch()}
          className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {running
            ? `Generating… (${results.length}/${selected.length})`
            : `Generate ${selected.length || ""} selected`.trim()}
        </button>
      </div>

      <p className="mb-4 text-sm text-muted">
        Schedule mode staggers go-live dates (default 1/day from the start time). Posts stay hidden until published_at. Also run{" "}
        <code className="text-foreground">supabase/posts-scheduling.sql</code> in Supabase so RLS matches.
      </p>

      <div className="flex flex-col gap-2">
        {visible.map((topic) => {
          const checked = selected.includes(topic.id);
          return (
            <label
              key={topic.id}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 ${
                checked ? "border-accent/50 bg-accent/5" : "border-border bg-surface"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(topic.id)}
                className="mt-1"
              />
              <span className="min-w-0">
                <span className="font-mono text-xs text-accent">{topic.cluster}</span>
                <span className="mt-1 block text-sm font-medium text-foreground">{topic.title}</span>
                <span className="mt-1 block text-sm text-muted">{topic.angle}</span>
              </span>
            </label>
          );
        })}
      </div>

      {results.length > 0 && (
        <div className="mt-8 rounded-lg border border-border bg-surface p-4">
          <h2 className="font-mono text-xs uppercase tracking-wider text-accent">Results</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {results.map((result) => (
              <li key={result.id} className="text-sm text-muted">
                <span className={result.ok ? "text-positive" : "text-red-400"}>
                  {result.ok ? "✓" : "✕"}
                </span>{" "}
                {result.title} · {result.message}
                {result.slug && (
                  <>
                    {" "}
                    ·{" "}
                    <Link href={`/articles/${result.slug}`} className="text-accent hover:underline">
                      view
                    </Link>
                    {" · "}
                    <Link href="/admin" className="text-accent hover:underline">
                      admin
                    </Link>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
