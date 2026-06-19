import { createClient } from "@/lib/supabase/server";
import type { Service } from "@/lib/types";
import { BookingForm } from "./booking-form";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { PageHeader } from "@/components/page-header";

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service } = await searchParams;
  const supabase = await createClient();
  const { data: services } = await supabase
    .from("services")
    .select("id, name, category, price_rwf, duration_minutes")
    .eq("is_active", true)
    .order("category")
    .returns<Service[]>();

  return (
    <div className="min-h-full flex flex-col">
      <Nav />
      <PageHeader
        title="Book a Repair"
        subtitle="Free diagnostics, a written quote before we start, and a 30-day warranty on every job."
      />

      <main className="mx-auto max-w-xl px-6 py-12 flex-1 w-full">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <BookingForm services={services ?? []} initialServiceId={service} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
