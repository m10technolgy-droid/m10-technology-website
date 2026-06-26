import { createClient } from "@/lib/supabase/server";
import type { Category, Part } from "@/lib/types";
import { PartsManager } from "./parts-manager";

export default async function AdminPartsPage() {
  const supabase = await createClient();

  const { data: parts, error } = await supabase
    .from("parts")
    .select("id, name, category, stock_quantity, selling_price_rwf, last_buy_price_rwf")
    .order("category")
    .order("name")
    .returns<Part[]>();

  const { data: categories } = await supabase
    .from("part_categories")
    .select("id, name")
    .order("name")
    .returns<Category[]>();

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-zinc-900">Parts Stock</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Track screens, batteries, cameras, and other repair parts on hand.
      </p>

      {error && <p className="mt-4 text-red-600">Could not load parts: {error.message}</p>}

      <PartsManager parts={parts ?? []} categories={categories ?? []} />
    </main>
  );
}
