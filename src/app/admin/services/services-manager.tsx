"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Category, Service } from "@/lib/types";

type AdminService = Service & { is_active: boolean };

function emptyForm(categories: Category[]) {
  return {
    name: "",
    category: categories[0]?.name ?? "",
    description: "",
    price_rwf: "",
    duration_minutes: "",
  };
}

export function ServicesManager({
  services,
  categories,
}: {
  services: AdminService[];
  categories: Category[];
}) {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm(categories));
  const [adding, setAdding] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.from("services").insert({
      name: form.name,
      category: form.category,
      description: form.description || null,
      price_rwf: Number(form.price_rwf),
      duration_minutes: Number(form.duration_minutes),
      is_active: true,
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setForm(emptyForm(categories));
      router.refresh();
    }
    setAdding(false);
  }

  return (
    <div className="mt-6">
      <form onSubmit={handleAdd} className="grid grid-cols-2 gap-3 rounded-lg border border-zinc-200 bg-white p-4 sm:grid-cols-6">
        <input required placeholder="Name" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="rounded border border-zinc-300 px-2 py-1 text-sm sm:col-span-2" />
        <select required value={form.category} disabled={categories.length === 0}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="rounded border border-zinc-300 px-2 py-1 text-sm sm:col-span-1">
          {categories.length === 0 && <option value="">Add a category first</option>}
          {categories.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
        <input placeholder="Description" value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="rounded border border-zinc-300 px-2 py-1 text-sm sm:col-span-2" />
        <input required type="number" placeholder="Price (RWF)" value={form.price_rwf}
          onChange={(e) => setForm({ ...form, price_rwf: e.target.value })}
          className="rounded border border-zinc-300 px-2 py-1 text-sm sm:col-span-1" />
        <input required type="number" placeholder="Duration (min)" value={form.duration_minutes}
          onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
          className="rounded border border-zinc-300 px-2 py-1 text-sm sm:col-span-2" />
        <button type="submit" disabled={adding || categories.length === 0}
          className="rounded bg-black px-3 py-1 text-sm text-white disabled:opacity-40 sm:col-span-1">
          {adding ? "Adding..." : "Add service"}
        </button>
      </form>
      {errorMessage && <p className="mt-2 text-sm text-red-600">{errorMessage}</p>}

      <div className="mt-6 space-y-3">
        {services.length === 0 && <p className="text-zinc-600">No services yet.</p>}
        {services.map((service) => (
          <ServiceRow key={service.id} service={service} categories={categories} />
        ))}
      </div>
    </div>
  );
}

function ServiceRow({ service, categories }: { service: AdminService; categories: Category[] }) {
  const router = useRouter();
  const [category, setCategory] = useState(service.category);
  const [priceRwf, setPriceRwf] = useState(String(service.price_rwf));
  const [isActive, setIsActive] = useState(service.is_active);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function save() {
    setSaving(true);
    setErrorMessage("");
    const supabase = createClient();
    const { error } = await supabase
      .from("services")
      .update({ category, price_rwf: Number(priceRwf), is_active: isActive })
      .eq("id", service.id);

    if (error) {
      setErrorMessage(error.message);
    } else {
      router.refresh();
    }
    setSaving(false);
  }

  async function remove() {
    setSaving(true);
    setErrorMessage("");
    const supabase = createClient();
    const { error } = await supabase.from("services").delete().eq("id", service.id);

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
    } else {
      router.refresh();
    }
  }

  // The service's current category may not be in the managed list yet
  // (legacy free-text value), keep it selectable so saving doesn't silently change it.
  const categoryOptions = categories.some((c) => c.name === category)
    ? categories
    : [{ id: "current", name: category }, ...categories];

  const dirty =
    category !== service.category ||
    Number(priceRwf) !== service.price_rwf ||
    isActive !== service.is_active;

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-zinc-200 bg-white p-4">
      <div className="min-w-[200px]">
        <p className="font-medium">{service.name}</p>
        <p className="text-sm text-zinc-500">{service.duration_minutes} min</p>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-500">Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="mt-1 rounded border border-zinc-300 px-2 py-1 text-sm">
          {categoryOptions.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-500">Price (RWF)</label>
        <input type="number" value={priceRwf} onChange={(e) => setPriceRwf(e.target.value)}
          className="mt-1 w-28 rounded border border-zinc-300 px-2 py-1 text-sm" />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        Active
      </label>

      <button onClick={save} disabled={saving || !dirty}
        className="rounded bg-black px-3 py-1 text-sm text-white disabled:opacity-40">
        {saving ? "Saving..." : "Save"}
      </button>
      <button onClick={remove} disabled={saving}
        className="rounded border border-red-300 px-3 py-1 text-sm text-red-600 disabled:opacity-40">
        Delete
      </button>

      {errorMessage && <p className="w-full text-sm text-red-600">{errorMessage}</p>}
    </div>
  );
}
