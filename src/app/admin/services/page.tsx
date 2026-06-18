import { createClient } from "@/lib/supabase/server";
import type { Category, Service } from "@/lib/types";
import { ServicesManager } from "./services-manager";
import { CategoriesManager } from "./categories-manager";

export default async function AdminServicesPage() {
  const supabase = await createClient();

  const { data: services, error } = await supabase
    .from("services")
    .select("id, name, category, description, price_rwf, duration_minutes, is_active")
    .order("category")
    .returns<(Service & { is_active: boolean })[]>();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("name")
    .returns<Category[]>();

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Services & Pricing</h1>

      {error && <p className="mt-4 text-red-600">Could not load services: {error.message}</p>}

      <div className="mt-6">
        <CategoriesManager categories={categories ?? []} />
      </div>

      <ServicesManager services={services ?? []} categories={categories ?? []} />
    </main>
  );
}
