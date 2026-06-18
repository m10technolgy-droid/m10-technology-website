"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-sm font-medium text-zinc-600 hover:text-brand-red transition-colors"
    >
      Sign out
    </button>
  );
}
