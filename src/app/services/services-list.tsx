"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ImageOff } from "lucide-react";
import type { Service } from "@/lib/types";

type ServiceWithImage = Service & { imageUrl: string | null };

export function ServicesList({ services }: { services: ServiceWithImage[] }) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const allCategories = Array.from(new Set(services.map((s) => s.category)));

  const query = search.trim().toLowerCase();
  const filtered = services.filter((s) => {
    if (categoryFilter !== "all" && s.category !== categoryFilter) return false;
    if (query && !s.name.toLowerCase().includes(query)) return false;
    return true;
  });
  const categories = categoryFilter === "all"
    ? allCategories
    : allCategories.filter((c) => c === categoryFilter);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for your device or service..."
            className="w-full rounded-md border border-zinc-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
              categoryFilter === "all" ? "bg-brand-navy text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            All
          </button>
          {allCategories.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                categoryFilter === c ? "bg-brand-navy text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <p className="mt-8 text-zinc-600">No services match your search.</p>
      )}

      {categories.map((category) => {
        const inCategory = filtered.filter((s) => s.category === category);
        if (inCategory.length === 0) return null;
        return (
          <div key={category} className="mt-10">
            <h2 className="text-lg font-semibold text-zinc-900 capitalize">{category}</h2>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {inCategory.map((service) => (
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
        );
      })}
    </div>
  );
}
