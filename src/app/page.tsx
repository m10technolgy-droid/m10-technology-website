import Link from "next/link";
import Image from "next/image";
import { ScanSearch, Zap, ShieldCheck, Smartphone } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { RepairShowcaseSlideshow } from "@/components/repair-showcase-slideshow";
import { createClient } from "@/lib/supabase/server";
import type { RepairShowcase } from "@/lib/types";

const features = [
  {
    icon: ScanSearch,
    title: "Free Diagnostics",
    description: "Every device assessed at no charge before any quote is given.",
  },
  {
    icon: Zap,
    title: "Same-Day Repairs",
    description: "Most repairs completed within 2 to 6 hours of drop-off.",
  },
  {
    icon: ShieldCheck,
    title: "30-Day Warranty",
    description: "All repair work guaranteed for 30 days — no competitor in Rubavu offers this.",
  },
  {
    icon: Smartphone,
    title: "All Brands",
    description: "iPhone, Samsung, Huawei, Tecno, HP, Dell, Lenovo, MacBook and more.",
  },
];

const services = [
  { name: "Screen Replacement", range: "10,000 – 40,000 RWF" },
  { name: "Battery Replacement", range: "10,000 – 60,000 RWF" },
  { name: "Charging Port Repair", range: "8,000 – 20,000 RWF" },
  { name: "Motherboard Repair", range: "15,000 – 80,000 RWF" },
  { name: "Virus Removal & OS Reinstall", range: "10,000 – 20,000 RWF" },
  { name: "Data Recovery", range: "20,000 – 50,000 RWF" },
];

export default async function Home() {
  const supabase = await createClient();
  const { data: showcases } = await supabase
    .from("repair_showcases")
    .select("id, title, before_image_path, after_image_path")
    .order("created_at", { ascending: false })
    .limit(10)
    .returns<Pick<RepairShowcase, "id" | "title" | "before_image_path" | "after_image_path">[]>();

  const slides = (showcases ?? []).map((s) => ({
    id: s.id,
    title: s.title,
    beforeUrl: supabase.storage.from("repair-photos").getPublicUrl(s.before_image_path).data.publicUrl,
    afterUrl: supabase.storage.from("repair-photos").getPublicUrl(s.after_image_path).data.publicUrl,
  }));

  const hasSlides = slides.length > 0;

  return (
    <div className="min-h-full flex flex-col">
      <Nav />

      {/* Hero */}
      <section className="bg-brand-navy text-white py-20 px-6">
        <div className={`mx-auto grid items-center gap-12 ${hasSlides ? "max-w-6xl lg:grid-cols-2" : "max-w-4xl"}`}>
          <div className={hasSlides ? "text-center lg:text-left" : "text-center"}>
            <div className={`flex mb-6 ${hasSlides ? "justify-center lg:justify-start" : "justify-center"}`}>
              <Image src="/logo.png" alt="M10 Technology" width={100} height={100} className="brightness-0 invert" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              Fast, Reliable Device Repair<br />
              <span className="text-brand-red">in Rubavu, Rwanda</span>
            </h1>
            <p className={`mt-4 text-lg text-zinc-300 max-w-xl ${hasSlides ? "mx-auto lg:mx-0" : "mx-auto"}`}>
              Professional repair for all phone and computer brands. Free diagnostics, transparent pricing, 30-day warranty on every job.
            </p>
            <div className={`mt-8 flex flex-col sm:flex-row gap-3 ${hasSlides ? "justify-center lg:justify-start" : "justify-center"}`}>
              <Link
                href="/booking"
                className="px-8 py-3 text-base font-semibold text-white rounded-md bg-brand-red hover:bg-brand-red-dark transition-colors"
              >
                Book a Repair
              </Link>
              <Link
                href="/services"
                className="px-8 py-3 text-base font-semibold text-white border border-white/30 rounded-md hover:bg-white/10 transition-colors"
              >
                View Services & Pricing
              </Link>
            </div>
            <p className="mt-6 text-sm text-zinc-400">
              Open Mon – Sun &nbsp;·&nbsp; 8:00 AM – 9:00 PM &nbsp;·&nbsp; Ubuntu House, 2nd Floor, Rubavu
            </p>
          </div>

          {hasSlides && <RepairShowcaseSlideshow slides={slides} />}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-zinc-50">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-center text-zinc-900">Why choose M10 Technology?</h2>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-xl p-6 shadow-sm border border-zinc-100 transition-shadow hover:shadow-md"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-navy/5 text-brand-navy">
                  <f.icon className="h-6 w-6" strokeWidth={1.75} />
                </span>
                <h3 className="mt-4 font-semibold text-zinc-900">{f.title}</h3>
                <p className="mt-1 text-sm text-zinc-600">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services preview */}
      <section className="py-16 px-6 bg-white">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-zinc-900">Repair Services</h2>
            <Link href="/services" className="text-sm font-medium text-brand-blue hover:underline">
              View all prices
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {services.map((s) => (
              <div
                key={s.name}
                className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
              >
                <span className="font-medium text-zinc-800">{s.name}</span>
                <span className="text-sm text-zinc-500 ml-4 whitespace-nowrap">{s.range}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/booking"
              className="inline-block px-8 py-3 text-sm font-semibold text-white rounded-md bg-brand-red hover:bg-brand-red-dark transition-colors"
            >
              Book your repair now
            </Link>
          </div>
        </div>
      </section>

      {/* Second-hand devices CTA */}
      <section className="py-16 px-6 bg-brand-blue">
        <div className="mx-auto max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-white">
            <h2 className="text-2xl font-bold">Quality Second-Hand Devices</h2>
            <p className="mt-2 text-blue-100">
              Inspected, tested, and guaranteed. Phones and laptops at fair prices — every device comes with our quality assurance.
            </p>
          </div>
          <Link
            href="/inventory"
            className="shrink-0 px-8 py-3 text-sm font-semibold text-brand-blue bg-white rounded-md hover:bg-zinc-100 transition-colors"
          >
            Browse devices
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
