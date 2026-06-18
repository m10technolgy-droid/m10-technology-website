import { createClient } from "@/lib/supabase/server";
import type { InventoryItem } from "@/lib/types";
import { InventoryManager } from "./inventory-manager";

export default async function AdminInventoryPage() {
  const supabase = await createClient();

  const { data: items, error } = await supabase
    .from("inventory")
    .select("id, device_type, brand, model, condition_grade, price_rwf, photo_urls, status")
    .order("created_at", { ascending: false })
    .returns<InventoryItem[]>();

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Inventory</h1>

      {error && <p className="mt-4 text-red-600">Could not load inventory: {error.message}</p>}

      <InventoryManager items={items ?? []} />
    </main>
  );
}
