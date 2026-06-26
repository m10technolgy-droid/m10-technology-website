import { createClient } from "@/lib/supabase/server";
import type { Service } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { PageHeader } from "@/components/page-header";

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

  const categories = Array.from(new Set(withUrls.map((s) => s.category)));

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

        {categories.map((category) => (
          <div key={category} className="mb-10">
            <h2 className="text-lg font-semibold text-zinc-900 capitalize">{category}</h2>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {withUrls
                .filter((s) => s.category === category)
                .map((service) => (
                  <Link
                    key={service.id}
                    href={`/booking?service=${service.id}`}
                    className="flex gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md hover:border-brand-red/40"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-navy/5 text-brand-navy">
                      {service.imageUrl ? (
                        <Image src={service.imageUrl} alt={service.name} width={56} height={56} className="h-full w-full object-cover" />
                      ) : (
                        <ImageOff size={20} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="font-medium text-zinc-900">{service.name}</h3>
                        <span className="text-sm font-semibold whitespace-nowrap text-brand-red">
                          {service.price_rwf.toLocaleString()} RWF
                        </span>
                      </div>
                      {service.description && (
                        <p className="mt-1 text-sm text-zinc-600">{service.description}</p>
                      )}
                      <p className="mt-2 text-xs text-zinc-400">~{service.duration_minutes} min</p>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        ))}

        {withUrls.length > 0 && (
          <div className="text-center">
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
