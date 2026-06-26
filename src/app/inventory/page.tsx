import { createClient } from "@/lib/supabase/server";
import type { InventoryItem } from "@/lib/types";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { PageHeader } from "@/components/page-header";
import { InventoryList } from "./inventory-list";

export default async function InventoryPage() {
  const supabase = await createClient();
  const { data: items, error } = await supabase
    .from("inventory")
    .select(
      "id, device_type, brand, model, condition_grade, price_rwf, photo_urls, status, " +
      "screen_changed, screen_genuine, battery_changed, battery_genuine, camera_changed, camera_genuine, faceid_working, " +
      "storage_gb, battery_health_percent"
    )
    .eq("status", "available")
    .order("created_at", { ascending: false })
    .returns<InventoryItem[]>();

  return (
    <div className="min-h-full flex flex-col">
      <Nav />
      <PageHeader
        title="Second-Hand Devices"
        subtitle="Inspected, tested, and guaranteed. Every device comes with our quality assurance, no surprises."
      />

      <main className="mx-auto max-w-4xl px-6 py-12 flex-1 w-full">
        {error && (
          <p className="text-red-600">Could not load inventory: {error.message}</p>
        )}

        {!error && (!items || items.length === 0) && (
          <p className="text-zinc-600">
            No devices listed yet. Add some in the Supabase inventory table.
          </p>
        )}

        {items && items.length > 0 && <InventoryList items={items} />}
      </main>

      <Footer />
    </div>
  );
}
