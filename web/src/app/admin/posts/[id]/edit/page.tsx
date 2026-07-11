import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SectionHeading } from "@/components/ui";
import { PostEditor } from "@/components/admin/post-editor";

export const metadata: Metadata = { title: "Edit post · Admin" };
export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: post } = supabase
    ? await supabase.from("posts").select("*").eq("id", id).maybeSingle()
    : { data: null };

  if (!post) notFound();

  return (
    <div>
      <SectionHeading eyebrow="Content management" title="Edit post" />
      <PostEditor post={post} />
    </div>
  );
}
