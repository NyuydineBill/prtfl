"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="rounded-md border border-border px-3 py-1.5 text-sm text-muted hover:border-accent hover:text-accent"
    >
      Sign out
    </button>
  );
}
