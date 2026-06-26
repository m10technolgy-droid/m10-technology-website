import { createClient } from "@/lib/supabase/server";
import type { InventoryItem } from "@/lib/types";
import Image from "next/image";
import { Laptop, Monitor, Smartphone, Wrench, ScanFace, type LucideIcon } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { PageHeader } from "@/components/page-header";

function deviceIcon(deviceType: string): LucideIcon {
  const type = deviceType.toLowerCase();
  if (type.includes("laptop")) return Laptop;
  if (type.includes("desktop") || type.includes("tower") || type.includes("pc")) return Monitor;
  if (type.includes("phone")) return Smartphone;
  return Wrench;
}

function PartBadge({ label, genuine }: { label: string; genuine: boolean | null }) {
  if (genuine === null) return null;
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
        genuine ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
      }`}
    >
      {label}: {genuine ? "Genuine" : "Aftermarket"}
    </span>
  );
}

export default async function InventoryPage() {
  const supabase = await createClient();
  const { data: items, error } = await supabase
    .from("inventory")
    .select(
      "id, device_type, brand, model, condition_grade, price_rwf, photo_urls, status, " +
      "screen_changed, screen_genuine, battery_changed, battery_genuine, camera_changed, camera_genuine, faceid_working"
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

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {items?.map((item) => {
            const Icon = deviceIcon(item.device_type);
            const photos = item.photo_urls ?? [];
            return (
              <li
                key={item.id}
                className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  {photos.length > 0 ? (
                    <div className="flex shrink-0 -space-x-3">
                      {photos.slice(0, 3).map((url, i) => (
                        <Image
                          key={url}
                          src={url}
                          alt={`${item.brand} ${item.model}`}
                          width={56}
                          height={56}
                          className="h-14 w-14 rounded-lg border-2 border-white object-cover shadow-sm"
                          style={{ zIndex: 3 - i }}
                        />
                      ))}
                    </div>
                  ) : (
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-navy/5 text-brand-navy">
                      <Icon className="h-6 w-6" strokeWidth={1.75} />
                    </span>
                  )}
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <h2 className="font-medium text-zinc-900">
                        {item.brand} {item.model}
                      </h2>
                      <span className="text-sm font-semibold whitespace-nowrap text-brand-red">
                        {item.price_rwf.toLocaleString()} RWF
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-zinc-500 capitalize">{item.device_type}</p>
                    <span className="mt-2 inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 capitalize">
                      Grade {item.condition_grade}
                    </span>
                  </div>
                </div>

                {(item.screen_changed || item.battery_changed || item.camera_changed || item.faceid_working !== null) && (
                  <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-zinc-100 pt-3">
                    {item.screen_changed && <PartBadge label="Screen" genuine={item.screen_genuine} />}
                    {item.battery_changed && <PartBadge label="Battery" genuine={item.battery_genuine} />}
                    {item.camera_changed && <PartBadge label="Camera" genuine={item.camera_genuine} />}
                    {item.faceid_working !== null && (
                      <span
                        className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          item.faceid_working ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                        }`}
                      >
                        <ScanFace size={12} />
                        Face ID {item.faceid_working ? "working" : "not working"}
                      </span>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </main>

      <Footer />
    </div>
  );
}
