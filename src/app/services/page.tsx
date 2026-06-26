import { createClient } from "@/lib/supabase/server";
import type { Service } from "@/lib/types";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { PageHeader } from "@/components/page-header";
import { ServicesList } from "./services-list";

export default async function ServicesPage() {
  const supabase = await createClient();
  const { data: services, error } = await supabase
    .from("services")
    .select("id, name, category, description, price_rwf, duration_minutes, image_path")
    .eq("is_active", true)
    .order("category")
    .returns<Service[]>();

  const withUrls = (services ?? []).map((s) => ({
    ...s,
    imageUrl: s.image_path
      ? supabase.storage.from("repair-photos").getPublicUrl(s.image_path).data.publicUrl
      : null,
  }));

  return (
    <div className="min-h-full flex flex-col">
      <Nav />
      <PageHeader
        title="Our Repair Services"
        subtitle="Free diagnostics on every device. Transparent, written pricing before we start work. 30-day warranty on every job."
      />

      <main className="mx-auto max-w-4xl px-6 py-12 flex-1 w-full">
        {error && (
          <p className="text-red-600">Could not load services: {error.message}</p>
        )}

        {!error && withUrls.length === 0 && (
          <p className="text-zinc-600">
            No services published yet. Add some in the Supabase services table.
          </p>
        )}

        {withUrls.length > 0 && <ServicesList services={withUrls} />}

        {withUrls.length > 0 && (
          <div className="mt-10 text-center">
            <Link
              href="/booking"
              className="inline-block px-8 py-3 text-sm font-semibold text-white rounded-md bg-brand-red hover:bg-brand-red-dark transition-colors"
            >
              Book an appointment
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
