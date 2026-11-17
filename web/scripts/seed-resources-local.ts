#!/usr/bin/env npx tsx
/**
 * Upsert the handwritten resources in scripts/local-resources into Supabase.
 * Matches on slug, so re-running updates content instead of duplicating rows.
 *
 * New rows are inserted as drafts so they can be reviewed in /admin/resources.
 * Existing rows keep their current status unless --publish is passed.
 *
 * Usage:
 *   npx tsx scripts/seed-resources-local.ts
 *   npx tsx scripts/seed-resources-local.ts --publish
 *   npx tsx scripts/seed-resources-local.ts --only=git-github-field-guide
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { localResources } from "./local-resources";

function loadEnv() {
  const path = resolve(process.cwd(), ".env.local");
  const raw = readFileSync(path, "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

function arg(name: string) {
  const hit = process.argv.find((item) => item.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : undefined;
}

async function main() {
  loadEnv();

  const publish = process.argv.includes("--publish");
  const only = arg("only");
  const items = only ? localResources.filter((r) => r.slug === only) : localResources;
  if (items.length === 0) throw new Error(`No resource with slug "${only}"`);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  for (const resource of items) {
    const body = readFileSync(
      resolve(process.cwd(), "scripts/local-resources/content", `${resource.slug}.md`),
      "utf8",
    ).trim();

    const fields = {
      title: resource.title,
      kind: resource.kind,
      summary: resource.summary,
      body,
      level: resource.level,
      topics: resource.topics,
      sort_order: resource.sort_order,
      updated_at: new Date().toISOString(),
    };

    const { data: existing, error: lookupError } = await admin
      .from("resources")
      .select("id, status")
      .eq("slug", resource.slug)
      .maybeSingle();
    if (lookupError) throw new Error(lookupError.message);

    if (existing) {
      const { error } = await admin
        .from("resources")
        .update(publish ? { ...fields, status: "published" } : fields)
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
      console.log(`updated  ${resource.slug} (${publish ? "published" : existing.status})`);
    } else {
      const status = publish ? "published" : "draft";
      const { error } = await admin
        .from("resources")
        .insert({ ...fields, slug: resource.slug, status });
      if (error) throw new Error(error.message);
      console.log(`inserted ${resource.slug} (${status})`);
    }
  }

  console.log(
    publish
      ? "\nDone. Resources are live at /resources."
      : "\nDone. Review them in /admin/resources, then publish there or re-run with --publish.",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
