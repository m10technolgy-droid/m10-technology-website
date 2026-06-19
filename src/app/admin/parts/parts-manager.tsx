"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Category, Part, PartStockEntry } from "@/lib/types";
import { PartCategoriesManager } from "./part-categories-manager";

export function PartsManager({ parts, categories }: { parts: Part[]; categories: Category[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState(categories[0]?.name ?? "");
  const [adding, setAdding] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.from("parts").insert({ name, category });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setName("");
      router.refresh();
    }
    setAdding(false);
  }

  const usedCategories = Array.from(new Set(parts.map((p) => p.category)));

  return (
    <div className="mt-6 space-y-6">
      <PartCategoriesManager categories={categories} />

      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3 rounded-lg border border-zinc-200 bg-white p-4">
        <input
          required
          placeholder="Part name (e.g. iPhone 12 Screen)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 min-w-[200px] rounded border border-zinc-300 px-2 py-1 text-sm"
        />
        <select
          required
          value={category}
          disabled={categories.length === 0}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded border border-zinc-300 px-2 py-1 text-sm capitalize"
        >
          {categories.length === 0 && <option value="">Add a category first</option>}
          {categories.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={adding || categories.length === 0}
          className="rounded bg-black px-3 py-1 text-sm text-white disabled:opacity-40"
        >
          {adding ? "Adding..." : "Add part"}
        </button>
      </form>
      {errorMessage && <p className="mt-2 text-sm text-red-600">{errorMessage}</p>}

      <div className="space-y-6">
        {parts.length === 0 && <p className="text-zinc-600">No parts yet. Add one above.</p>}
        {usedCategories.map((categoryName) => {
          const inCategory = parts.filter((p) => p.category === categoryName);
          return (
            <div key={categoryName}>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 capitalize">{categoryName}</h2>
              <div className="mt-2 space-y-3">
                {inCategory.map((part) => (
                  <PartRow key={part.id} part={part} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PartRow({ part }: { part: Part }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [entries, setEntries] = useState<PartStockEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [receiveQty, setReceiveQty] = useState("1");
  const [buyPrice, setBuyPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState(part.selling_price_rwf?.toString() ?? "");
  const [receiveNote, setReceiveNote] = useState("");

  const [saleQty, setSaleQty] = useState("1");
  const [salePrice, setSalePrice] = useState("");
  const [saleNote, setSaleNote] = useState("");

  async function loadHistory() {
    setLoadingHistory(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("part_stock_entries")
      .select("id, part_id, entry_type, quantity, buy_price_rwf, selling_price_rwf, sale_price_rwf, note, created_at")
      .eq("part_id", part.id)
      .order("created_at", { ascending: false })
      .limit(10)
      .returns<PartStockEntry[]>();
    setEntries(data ?? []);
    setLoadingHistory(false);
  }

  async function toggleHistory() {
    const next = !historyOpen;
    setHistoryOpen(next);
    if (next) await loadHistory();
  }

  async function handleAddStock() {
    const qty = Number(receiveQty);
    if (!qty || qty < 1) return;
    setSaving(true);
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.from("part_stock_entries").insert({
      part_id: part.id,
      entry_type: "received",
      quantity: qty,
      buy_price_rwf: buyPrice ? Number(buyPrice) : null,
      selling_price_rwf: sellingPrice ? Number(sellingPrice) : null,
      note: receiveNote || null,
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setReceiveQty("1");
      setBuyPrice("");
      setReceiveNote("");
      router.refresh();
      if (historyOpen) await loadHistory();
    }
    setSaving(false);
  }

  async function handleRecordSale() {
    const qty = Number(saleQty);
    if (!qty || qty < 1) return;
    setSaving(true);
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.from("part_stock_entries").insert({
      part_id: part.id,
      entry_type: "sold",
      quantity: qty,
      sale_price_rwf: salePrice ? Number(salePrice) : null,
      note: saleNote || null,
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setSaleQty("1");
      setSalePrice("");
      setSaleNote("");
      router.refresh();
      if (historyOpen) await loadHistory();
    }
    setSaving(false);
  }

  async function deleteEntry(entryId: string) {
    setSaving(true);
    setErrorMessage("");
    const supabase = createClient();
    const { error } = await supabase.from("part_stock_entries").delete().eq("id", entryId);

    if (error) {
      setErrorMessage(error.message);
    } else {
      router.refresh();
      await loadHistory();
    }
    setSaving(false);
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="font-medium text-zinc-900">{part.name}</p>
        <div className="flex items-center gap-3">
          {part.selling_price_rwf != null && (
            <span className="text-sm text-zinc-500">Sells for {part.selling_price_rwf.toLocaleString()} RWF</span>
          )}
          {part.stock_quantity <= 0 ? (
            <span className="inline-block rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
              Out of stock
            </span>
          ) : (
            <span className="text-sm font-semibold text-zinc-900">{part.stock_quantity} in stock</span>
          )}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-green-200 bg-green-50/50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-green-700">Add stock</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <input
              type="number" min="1" value={receiveQty} onChange={(e) => setReceiveQty(e.target.value)}
              placeholder="Qty"
              className="w-16 rounded border border-zinc-300 px-2 py-1 text-sm"
            />
            <input
              type="number" min="0" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)}
              placeholder="Buy price"
              className="w-24 rounded border border-zinc-300 px-2 py-1 text-sm"
            />
            <input
              type="number" min="0" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)}
              placeholder="Sell price"
              className="w-24 rounded border border-zinc-300 px-2 py-1 text-sm"
            />
            <input
              value={receiveNote} onChange={(e) => setReceiveNote(e.target.value)}
              placeholder="Note (optional)"
              className="w-full rounded border border-zinc-300 px-2 py-1 text-sm sm:w-auto sm:flex-1"
            />
            <button
              onClick={handleAddStock}
              disabled={saving}
              className="rounded bg-green-700 px-3 py-1 text-sm text-white disabled:opacity-40"
            >
              + Add stock
            </button>
          </div>
        </div>

        <div className="rounded-md border border-red-200 bg-red-50/50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-700">Record sale</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <input
              type="number" min="1" value={saleQty} onChange={(e) => setSaleQty(e.target.value)}
              placeholder="Qty"
              className="w-16 rounded border border-zinc-300 px-2 py-1 text-sm"
            />
            <input
              type="number" min="0" value={salePrice} onChange={(e) => setSalePrice(e.target.value)}
              placeholder="Sale price"
              className="w-24 rounded border border-zinc-300 px-2 py-1 text-sm"
            />
            <input
              value={saleNote} onChange={(e) => setSaleNote(e.target.value)}
              placeholder="Note (optional)"
              className="w-full rounded border border-zinc-300 px-2 py-1 text-sm sm:w-auto sm:flex-1"
            />
            <button
              onClick={handleRecordSale}
              disabled={saving}
              className="rounded bg-brand-red px-3 py-1 text-sm text-white disabled:opacity-40"
            >
              − Record sale
            </button>
          </div>
        </div>
      </div>

      {errorMessage && <p className="mt-2 text-sm text-red-600">{errorMessage}</p>}

      <button
        onClick={toggleHistory}
        className="mt-3 text-xs font-medium text-brand-blue hover:underline"
      >
        {historyOpen ? "Hide recent activity" : "Show recent activity"}
      </button>

      {historyOpen && (
        <div className="mt-2 space-y-1 border-t border-zinc-100 pt-2">
          {loadingHistory && <p className="text-xs text-zinc-400">Loading...</p>}
          {!loadingHistory && entries.length === 0 && (
            <p className="text-xs text-zinc-400">No activity yet.</p>
          )}
          {entries.map((entry) => {
            const unitPrice = entry.entry_type === "received" ? entry.buy_price_rwf : entry.sale_price_rwf;
            return (
              <div key={entry.id} className="flex items-center justify-between text-xs text-zinc-600">
                <span>
                  <span className={entry.entry_type === "received" ? "text-green-700" : "text-red-600"}>
                    {entry.entry_type === "received" ? "+" : "-"}{entry.quantity}
                  </span>
                  {" "}
                  {entry.entry_type === "received" ? "bought" : "sold"}
                  {unitPrice != null && ` @ ${unitPrice.toLocaleString()} RWF each`}
                  {entry.entry_type === "received" && entry.selling_price_rwf != null &&
                    ` (sell price set to ${entry.selling_price_rwf.toLocaleString()} RWF)`}
                  {" "}&middot;{" "}
                  {new Date(entry.created_at).toLocaleDateString()}
                  {entry.note && <span className="text-zinc-400"> &middot; {entry.note}</span>}
                </span>
                <button
                  onClick={() => deleteEntry(entry.id)}
                  disabled={saving}
                  className="text-zinc-400 hover:text-red-600 disabled:opacity-40"
                >
                  Undo
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
