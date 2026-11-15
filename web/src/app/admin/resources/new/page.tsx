import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui";
import { ResourceEditor } from "@/components/admin/resource-editor";

export const metadata: Metadata = { title: "New resource · Admin" };

export default function NewResourcePage() {
  return (
    <div>
      <SectionHeading eyebrow="Content management" title="New resource" />
      <ResourceEditor />
    </div>
  );
}
