"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Trash2, ImageOff, Camera } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Category, Service } from "@/lib/types";

type AdminService = Service & { is_active: boolean; imageUrl: string | null };

function emptyForm(categories: Category[]) {
  return {
    name: "",
    category: categories[0]?.name ?? "",
    description: "",
    price_rwf: "",
    duration_minutes: "",
  };
}

function extOf(file: File) {
  const parts = file.name.split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "jpg";
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
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [adding, setAdding] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setErrorMessage("");

    const supabase = createClient();

    let imagePath: string | null = null;
    if (photoFile) {
      imagePath = `${crypto.randomUUID()}.${extOf(photoFile)}`;
      const { error: uploadError } = await supabase.storage
        .from("repair-photos")
        .upload(imagePath, photoFile);
      if (uploadError) {
        setErrorMessage(uploadError.message);
        setAdding(false);
        return;
      }
    }

    const { error } = await supabase.from("services").insert({
      name: form.name,
      category: form.category,
      description: form.description || null,
      price_rwf: Number(form.price_rwf),
      duration_minutes: Number(form.duration_minutes),
      is_active: true,
      image_path: imagePath,
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setForm(emptyForm(categories));
      setPhotoFile(null);
      router.refresh();
    }
    setAdding(false);
  }

  return (
    <div className="mt-6">
      <form onSubmit={handleAdd} className="grid grid-cols-2 gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:grid-cols-6">
        <input required placeholder="Name" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red sm:col-span-2" />
        <select required value={form.category} disabled={categories.length === 0}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red sm:col-span-1">
          {categories.length === 0 && <option value="">Add a category first</option>}
          {categories.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
        <input placeholder="Description" value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red sm:col-span-2" />
        <input required type="number" placeholder="Price (RWF)" value={form.price_rwf}
          onChange={(e) => setForm({ ...form, price_rwf: e.target.value })}
          className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red sm:col-span-1" />
        <input required type="number" placeholder="Duration (min)" value={form.duration_minutes}
          onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
          className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red sm:col-span-2" />
        <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
          className="text-sm sm:col-span-2 file:mr-3 file:rounded-md file:border-0 file:bg-brand-navy/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand-navy hover:file:bg-brand-navy/20" />
        <button type="submit" disabled={adding || categories.length === 0}
          className="flex items-center justify-center gap-1.5 rounded-md bg-brand-navy px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-navy/90 disabled:opacity-40 sm:col-span-1">
          <Plus size={15} />
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
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handlePhotoChange(file: File | null) {
    if (!file) return;
    setUploadingPhoto(true);
    setErrorMessage("");

    const supabase = createClient();
    const imagePath = `${crypto.randomUUID()}.${extOf(file)}`;
    const { error: uploadError } = await supabase.storage
      .from("repair-photos")
      .upload(imagePath, file);

    if (uploadError) {
      setErrorMessage(uploadError.message);
      setUploadingPhoto(false);
      return;
    }

    const { error } = await supabase
      .from("services")
      .update({ image_path: imagePath })
      .eq("id", service.id);

    if (error) {
      setErrorMessage(error.message);
    } else {
      router.refresh();
    }
    setUploadingPhoto(false);
  }

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
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <label className="relative flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-zinc-100 text-zinc-400">
        {service.imageUrl ? (
          <Image src={service.imageUrl} alt={service.name} width={56} height={56} className="h-full w-full object-cover" />
        ) : (
          <ImageOff size={20} />
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition-opacity hover:bg-black/40 hover:opacity-100">
          <Camera size={16} />
        </span>
        <input
          type="file"
          accept="image/*"
          disabled={uploadingPhoto}
          onChange={(e) => handlePhotoChange(e.target.files?.[0] ?? null)}
          className="hidden"
        />
      </label>

      <div className="min-w-[200px]">
        <div className="flex items-center gap-2">
          <p className="font-medium text-zinc-900">{service.name}</p>
          {!isActive && (
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500">Inactive</span>
          )}
        </div>
        <p className="text-sm text-zinc-500">{service.duration_minutes} min</p>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-500">Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="mt-1 rounded-md border border-zinc-300 px-2 py-1 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red">
          {categoryOptions.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-500">Price (RWF)</label>
        <input type="number" value={priceRwf} onChange={(e) => setPriceRwf(e.target.value)}
          className="mt-1 w-28 rounded-md border border-zinc-300 px-2 py-1 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red" />
      </div>

      <label className="flex items-center gap-2 text-sm text-zinc-700">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        Active
      </label>

      <button onClick={save} disabled={saving || !dirty}
        className="rounded-md bg-brand-navy px-3 py-1 text-sm text-white transition-colors hover:bg-brand-navy/90 disabled:opacity-40">
        {saving ? "Saving..." : "Save"}
      </button>
      <button onClick={remove} disabled={saving}
        className="flex items-center gap-1.5 rounded-md border border-red-300 px-3 py-1 text-sm text-red-600 transition-colors hover:bg-red-50 disabled:opacity-40">
        <Trash2 size={14} />
        Delete
      </button>

      {errorMessage && <p className="w-full text-sm text-red-600">{errorMessage}</p>}
    </div>
  );
}
