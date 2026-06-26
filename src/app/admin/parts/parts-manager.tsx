"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Minus,
  Search,
  ChevronDown,
  ChevronUp,
  PackagePlus,
  ShoppingCart,
  History,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Category, Part, PartStockEntry } from "@/lib/types";
import { PartCategoriesManager } from "./part-categories-manager";

export function PartsManager({ parts, categories }: { parts: Part[]; categories: Category[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState(categories[0]?.name ?? "");
  const [adding, setAdding] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

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

  const query = search.trim().toLowerCase();
  const filteredParts = parts.filter((p) => {
    if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
    if (query && !p.name.toLowerCase().includes(query)) return false;
    return true;
  });
  const filteredCategories = categoryFilter === "all"
    ? usedCategories
    : usedCategories.filter((c) => c === categoryFilter);

  return (
    <div className="mt-6 space-y-6">
      <PartCategoriesManager categories={categories} />

      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <input
          required
          placeholder="Part name (e.g. iPhone 12 Screen)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 min-w-[200px] rounded-md border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
        />
        <select
          required
          value={category}
          disabled={categories.length === 0}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm capitalize outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
        >
          {categories.length === 0 && <option value="">Add a category first</option>}
          {categories.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={adding || categories.length === 0}
          className="flex items-center gap-1.5 rounded-md bg-brand-navy px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-navy/90 disabled:opacity-40"
        >
          <Plus size={15} />
          {adding ? "Adding..." : "Add part"}
        </button>
      </form>
      {errorMessage && <p className="mt-2 text-sm text-red-600">{errorMessage}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search parts by name..."
            className="w-full rounded-md border border-zinc-300 py-1.5 pl-8 pr-3 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
              categoryFilter === "all" ? "bg-brand-navy text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            All
          </button>
          {usedCategories.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                categoryFilter === c ? "bg-brand-navy text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {parts.length === 0 && <p className="text-zinc-600">No parts yet. Add one above.</p>}
        {parts.length > 0 && filteredParts.length === 0 && (
          <p className="text-zinc-600">No parts match your search.</p>
        )}
        {filteredCategories.map((categoryName) => {
          const inCategory = filteredParts.filter((p) => p.category === categoryName);
          if (inCategory.length === 0) return null;
          return (
            <div key={categoryName}>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 capitalize">
                {categoryName} <span className="text-zinc-400">({inCategory.length})</span>
              </h2>
              <div className="mt-2 space-y-2">
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
  const [expanded, setExpanded] = useState(false);
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
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentStatus, setPaymentStatus] = useState<"paid" | "pending">("paid");
  const [saleNote, setSaleNote] = useState("");

  async function loadHistory() {
    setLoadingHistory(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("part_stock_entries")
      .select("id, part_id, entry_type, quantity, buy_price_rwf, selling_price_rwf, sale_price_rwf, cost_price_rwf, payment_method, payment_status, note, created_at")
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
      cost_price_rwf: part.last_buy_price_rwf,
      payment_method: paymentMethod,
      payment_status: paymentStatus,
      note: saleNote || null,
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setSaleQty("1");
      setSalePrice("");
      setPaymentMethod("cash");
      setPaymentStatus("paid");
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
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full flex-wrap items-baseline justify-between gap-3 p-4 text-left"
      >
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
          <span className="flex items-center gap-1 text-xs font-medium text-brand-navy">
            {expanded ? "Hide" : "Manage"}
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
        </div>
      </button>

      {expanded && (
      <div className="px-4 pb-4">
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-green-200 bg-green-50/50 p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-green-700">
            <PackagePlus size={14} /> Add stock
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <input
              type="number" min="1" value={receiveQty} onChange={(e) => setReceiveQty(e.target.value)}
              placeholder="Qty"
              className="w-16 rounded-md border border-zinc-300 px-2 py-1 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
            <input
              type="number" min="0" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)}
              placeholder="Buy price"
              className="w-24 rounded-md border border-zinc-300 px-2 py-1 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
            <input
              type="number" min="0" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)}
              placeholder="Sell price"
              className="w-24 rounded-md border border-zinc-300 px-2 py-1 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
            <input
              value={receiveNote} onChange={(e) => setReceiveNote(e.target.value)}
              placeholder="Note (optional)"
              className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 sm:w-auto sm:flex-1"
            />
            <button
              onClick={handleAddStock}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-md bg-green-700 px-3 py-1 text-sm text-white transition-colors hover:bg-green-800 disabled:opacity-40"
            >
              <Plus size={14} /> Add stock
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-red-200 bg-red-50/50 p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-red-700">
            <ShoppingCart size={14} /> Record sale
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <input
              type="number" min="1" value={saleQty} onChange={(e) => setSaleQty(e.target.value)}
              placeholder="Qty"
              className="w-16 rounded-md border border-zinc-300 px-2 py-1 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
            />
            <input
              type="number" min="0" value={salePrice} onChange={(e) => setSalePrice(e.target.value)}
              placeholder="Sale price"
              className="w-24 rounded-md border border-zinc-300 px-2 py-1 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
            />
            <select
              value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
              className="rounded-md border border-zinc-300 px-2 py-1 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
            >
              <option value="cash">Cash</option>
              <option value="momo">MoMo</option>
              <option value="crypto">Crypto</option>
            </select>
            <div className="flex rounded-md border border-zinc-300 overflow-hidden text-sm">
              <button
                type="button"
                onClick={() => setPaymentStatus("paid")}
                className={`px-2 py-1 transition-colors ${paymentStatus === "paid" ? "bg-brand-navy text-white" : "bg-white text-zinc-600"}`}
              >
                Paid now
              </button>
              <button
                type="button"
                onClick={() => setPaymentStatus("pending")}
                className={`px-2 py-1 transition-colors ${paymentStatus === "pending" ? "bg-brand-navy text-white" : "bg-white text-zinc-600"}`}
              >
                Pay later
              </button>
            </div>
            <input
              value={saleNote} onChange={(e) => setSaleNote(e.target.value)}
              placeholder="Note (optional)"
              className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red sm:w-auto sm:flex-1"
            />
            <button
              onClick={handleRecordSale}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-md bg-brand-red px-3 py-1 text-sm text-white transition-colors hover:bg-brand-red-dark disabled:opacity-40"
            >
              <Minus size={14} /> Record sale
            </button>
          </div>
        </div>
      </div>

      {errorMessage && <p className="mt-2 text-sm text-red-600">{errorMessage}</p>}

      <button
        onClick={toggleHistory}
        className="mt-3 flex items-center gap-1.5 text-xs font-medium text-brand-blue hover:underline"
      >
        <History size={13} />
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
                  {entry.entry_type === "sold" && entry.sale_price_rwf != null && entry.cost_price_rwf != null &&
                    ` (profit ${(entry.quantity * (entry.sale_price_rwf - entry.cost_price_rwf)).toLocaleString()} RWF)`}
                  {entry.entry_type === "sold" && entry.payment_method &&
                    ` · via ${entry.payment_method}`}
                  {entry.entry_type === "sold" && entry.payment_status === "pending" && (
                    <span className="font-medium text-amber-700"> &middot; pending payment</span>
                  )}
                  {" "}&middot;{" "}
                  {new Date(entry.created_at).toLocaleDateString()}
                  {entry.note && <span className="text-zinc-400"> &middot; {entry.note}</span>}
                </span>
                <button
                  onClick={() => deleteEntry(entry.id)}
                  disabled={saving}
                  className="flex items-center gap-1 text-zinc-400 hover:text-red-600 disabled:opacity-40"
                >
                  <Trash2 size={12} /> Undo
                </button>
              </div>
            );
          })}
        </div>
      )}
      </div>
      )}
    </div>
  );
}
