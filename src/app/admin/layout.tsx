import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "./sign-out-button";
import { AdminNav } from "./admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-full flex flex-col">
      <header className="sticky top-0 z-50 bg-brand-navy text-white shadow-md">
        <div className="mx-auto max-w-6xl px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <span className="font-bold tracking-tight">
              M10 <span className="text-brand-red">Admin</span>
            </span>
            <AdminNav />
          </div>
          <div className="[&_button]:text-white/70 [&_button:hover]:text-white">
            <SignOutButton />
          </div>
        </div>
      </header>
      <div className="flex-1 bg-zinc-50">{children}</div>
    </div>
  );
}
