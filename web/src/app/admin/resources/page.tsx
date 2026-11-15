import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { formatKindLabel, type Resource } from "@/lib/resources";
import { SectionHeading } from "@/components/ui";

export const metadata: Metadata = { title: "Resources · Admin" };
export const dynamic = "force-dynamic";

export default async function AdminResourcesPage() {
  const supabase = await createClient();
  const { data } = supabase
    ? await supabase
        .from("resources")
        .select("*")
        .order("kind", { ascending: true })
        .order("sort_order", { ascending: true })
        .order("updated_at", { ascending: false })
    : { data: null as Resource[] | null };

  const resources = (data as Resource[] | null) ?? [];

  return (
    <div>
      <SectionHeading
        eyebrow="Content management"
        title="Resources"
        description="Add any kind of resource: books, cheatsheets, tools, videos, templates, or your own label."
      />

      <Link
        href="/admin/resources/new"
        className="mb-8 inline-block rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-background hover:opacity-90"
      >
        New resource
      </Link>

      <div className="flex flex-col gap-3">
        {resources.length === 0 && (
          <p className="text-base text-muted">
            No resources yet. Add the first one when you are ready.
          </p>
        )}
        {resources.map((resource) => (
          <Link
            key={resource.id}
            href={`/admin/resources/${resource.id}/edit`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4 hover:border-accent/60"
          >
            <div>
              <p className="font-mono text-xs text-accent">{formatKindLabel(resource.kind)}</p>
              <h2 className="mt-1 font-medium text-foreground">{resource.title}</h2>
              <p className="mt-1 text-sm text-muted line-clamp-2">{resource.summary}</p>
            </div>
            <span
              className={`rounded-md border px-2.5 py-1 font-mono text-xs ${
                resource.status === "published"
                  ? "border-positive/40 text-positive"
                  : "border-border text-muted"
              }`}
            >
              {resource.status}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
