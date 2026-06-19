import { createClient } from "@/lib/supabase/server";
import type { Part } from "@/lib/types";
import { PartsManager } from "./parts-manager";

export default async function AdminPartsPage() {
  const supabase = await createClient();

  const { data: parts, error } = await supabase
    .from("parts")
    .select("id, name, category, stock_quantity, selling_price_rwf")
    .order("category")
    .order("name")
    .returns<Part[]>();

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Parts Stock</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Track screens, batteries, cameras, and other repair parts on hand.
      </p>

      {error && <p className="mt-4 text-red-600">Could not load parts: {error.message}</p>}

      <PartsManager parts={parts ?? []} />
    </main>
  );
}
