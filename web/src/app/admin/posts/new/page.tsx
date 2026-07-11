import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui";
import { PostEditor } from "@/components/admin/post-editor";

export const metadata: Metadata = { title: "New post · Admin" };

export default function NewPostPage() {
  return (
    <div>
      <SectionHeading eyebrow="Content management" title="New post" />
      <PostEditor />
    </div>
  );
}
