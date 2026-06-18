import Link from "next/link";
import Image from "next/image";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

const features = [
  {
    icon: "🔍",
    title: "Free Diagnostics",
    description: "Every device assessed at no charge before any quote is given.",
  },
  {
    icon: "⚡",
    title: "Same-Day Repairs",
    description: "Most repairs completed within 2 to 6 hours of drop-off.",
  },
  {
    icon: "🛡️",
    title: "30-Day Warranty",
    description: "All repair work guaranteed for 30 days — no competitor in Rubavu offers this.",
  },
  {
    icon: "📱",
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

export default function Home() {
  return (
    <div className="min-h-full flex flex-col">
      <Nav />

      {/* Hero */}
      <section className="bg-[#0B1F4A] text-white py-20 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="flex justify-center mb-6">
            <Image src="/logo.png" alt="M10 Technology" width={100} height={100} className="brightness-0 invert" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
            Fast, Reliable Device Repair<br />
            <span style={{ color: "#C0223B" }}>in Rubavu, Rwanda</span>
          </h1>
          <p className="mt-4 text-lg text-zinc-300 max-w-xl mx-auto">
            Professional repair for all phone and computer brands. Free diagnostics, transparent pricing, 30-day warranty on every job.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/booking"
              className="px-8 py-3 text-base font-semibold text-white rounded-md"
              style={{ backgroundColor: "#C0223B" }}
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
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-zinc-50">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-center text-zinc-900">Why choose M10 Technology?</h2>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-6 shadow-sm border border-zinc-100">
                <span className="text-3xl">{f.icon}</span>
                <h3 className="mt-3 font-semibold text-zinc-900">{f.title}</h3>
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
            <Link href="/services" className="text-sm font-medium" style={{ color: "#1D4ED8" }}>
              View all prices
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {services.map((s) => (
              <div key={s.name} className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3">
                <span className="font-medium text-zinc-800">{s.name}</span>
                <span className="text-sm text-zinc-500 ml-4 whitespace-nowrap">{s.range}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/booking"
              className="inline-block px-8 py-3 text-sm font-semibold text-white rounded-md"
              style={{ backgroundColor: "#C0223B" }}
            >
              Book your repair now
            </Link>
          </div>
        </div>
      </section>

      {/* Second-hand devices CTA */}
      <section className="py-16 px-6" style={{ backgroundColor: "#1D4ED8" }}>
        <div className="mx-auto max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-white">
            <h2 className="text-2xl font-bold">Quality Second-Hand Devices</h2>
            <p className="mt-2 text-blue-100">
              Inspected, tested, and guaranteed. Phones and laptops at fair prices — every device comes with our quality assurance.
            </p>
          </div>
          <Link
            href="/inventory"
            className="shrink-0 px-8 py-3 text-sm font-semibold text-[#1D4ED8] bg-white rounded-md hover:bg-zinc-100 transition-colors"
          >
            Browse devices
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
