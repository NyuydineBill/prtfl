import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/admin-nav";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <AdminNav />
      {children}
    </div>
  );
}
