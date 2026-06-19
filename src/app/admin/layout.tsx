import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "./sign-out-button";

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
      <header className="sticky top-0 z-50 bg-zinc-900 text-white">
        <div className="mx-auto max-w-6xl px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <span className="font-bold">M10 Admin</span>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/admin/bookings" className="hover:text-zinc-300">Bookings</Link>
              <Link href="/admin/inventory" className="hover:text-zinc-300">Inventory</Link>
              <Link href="/admin/services" className="hover:text-zinc-300">Services</Link>
              <Link href="/admin/showcases" className="hover:text-zinc-300">Showcases</Link>
              <Link href="/admin/parts" className="hover:text-zinc-300">Parts Stock</Link>
              <Link href="/admin/sales" className="hover:text-zinc-300">Sales</Link>
            </nav>
          </div>
          <div className="[&_button]:text-zinc-300 [&_button:hover]:text-white">
            <SignOutButton />
          </div>
        </div>
      </header>
      <div className="flex-1 bg-zinc-50">{children}</div>
    </div>
  );
}
