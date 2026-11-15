import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Resource } from "@/lib/resources";
import { SectionHeading } from "@/components/ui";
import { ResourceEditor } from "@/components/admin/resource-editor";

export const metadata: Metadata = { title: "Edit resource · Admin" };
export const dynamic = "force-dynamic";

export default async function EditResourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  if (!supabase) notFound();

  const { data } = await supabase.from("resources").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();

  return (
    <div>
      <SectionHeading eyebrow="Content management" title="Edit resource" />
      <ResourceEditor resource={data as Resource} />
    </div>
  );
}
