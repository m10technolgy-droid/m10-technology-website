"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { InventoryItem } from "@/lib/types";

const STATUSES = ["available", "reserved", "sold"];

const emptyForm = {
  device_type: "",
  brand: "",
  model: "",
  condition_grade: "",
  price_rwf: "",
  status: "available",
};

export function InventoryManager({ items }: { items: InventoryItem[] }) {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [adding, setAdding] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.from("inventory").insert({
      device_type: form.device_type,
      brand: form.brand,
      model: form.model,
      condition_grade: form.condition_grade,
      price_rwf: Number(form.price_rwf),
      status: form.status,
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setForm(emptyForm);
      router.refresh();
    }
    setAdding(false);
  }

  return (
    <div className="mt-6">
      <form onSubmit={handleAdd} className="grid grid-cols-2 gap-3 rounded-lg border border-zinc-200 bg-white p-4 sm:grid-cols-6">
        <input required placeholder="Device type" value={form.device_type}
          onChange={(e) => setForm({ ...form, device_type: e.target.value })}
          className="rounded border border-zinc-300 px-2 py-1 text-sm sm:col-span-1" />
        <input required placeholder="Brand" value={form.brand}
          onChange={(e) => setForm({ ...form, brand: e.target.value })}
          className="rounded border border-zinc-300 px-2 py-1 text-sm sm:col-span-1" />
        <input required placeholder="Model" value={form.model}
          onChange={(e) => setForm({ ...form, model: e.target.value })}
          className="rounded border border-zinc-300 px-2 py-1 text-sm sm:col-span-1" />
        <input required placeholder="Condition" value={form.condition_grade}
          onChange={(e) => setForm({ ...form, condition_grade: e.target.value })}
          className="rounded border border-zinc-300 px-2 py-1 text-sm sm:col-span-1" />
        <input required type="number" placeholder="Price (RWF)" value={form.price_rwf}
          onChange={(e) => setForm({ ...form, price_rwf: e.target.value })}
          className="rounded border border-zinc-300 px-2 py-1 text-sm sm:col-span-1" />
        <button type="submit" disabled={adding}
          className="rounded bg-black px-3 py-1 text-sm text-white disabled:opacity-40 sm:col-span-1">
          {adding ? "Adding..." : "Add device"}
        </button>
      </form>
      {errorMessage && <p className="mt-2 text-sm text-red-600">{errorMessage}</p>}

      <div className="mt-6 space-y-3">
        {items.length === 0 && <p className="text-zinc-600">No devices listed yet.</p>}
        {items.map((item) => (
          <InventoryRow key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function InventoryRow({ item }: { item: InventoryItem }) {
  const router = useRouter();
  const [status, setStatus] = useState(item.status);
  const [priceRwf, setPriceRwf] = useState(String(item.price_rwf));
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function save() {
    setSaving(true);
    setErrorMessage("");
    const supabase = createClient();
    const { error } = await supabase
      .from("inventory")
      .update({ status, price_rwf: Number(priceRwf) })
      .eq("id", item.id);

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
    const { error } = await supabase.from("inventory").delete().eq("id", item.id);

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
    } else {
      router.refresh();
    }
  }

  const dirty = status !== item.status || Number(priceRwf) !== item.price_rwf;

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-zinc-200 bg-white p-4">
      <div className="min-w-[160px]">
        <p className="font-medium">{item.brand} {item.model}</p>
        <p className="text-sm text-zinc-500">{item.device_type} &middot; Grade {item.condition_grade}</p>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-500">Price (RWF)</label>
        <input type="number" value={priceRwf} onChange={(e) => setPriceRwf(e.target.value)}
          className="mt-1 w-28 rounded border border-zinc-300 px-2 py-1 text-sm" />
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-500">Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="mt-1 rounded border border-zinc-300 px-2 py-1 text-sm">
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

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
