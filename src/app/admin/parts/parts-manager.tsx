"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Part, PartStockEntry } from "@/lib/types";

const CATEGORIES = [
  { value: "screen", label: "Screen" },
  { value: "battery", label: "Battery" },
  { value: "camera", label: "Camera" },
  { value: "other", label: "Other" },
];

export function PartsManager({ parts }: { parts: Part[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0].value);
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

  return (
    <div className="mt-6">
      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3 rounded-lg border border-zinc-200 bg-white p-4">
        <input
          required
          placeholder="Part name (e.g. iPhone 12 Screen)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 min-w-[200px] rounded border border-zinc-300 px-2 py-1 text-sm"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded border border-zinc-300 px-2 py-1 text-sm"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={adding}
          className="rounded bg-black px-3 py-1 text-sm text-white disabled:opacity-40"
        >
          {adding ? "Adding..." : "Add part"}
        </button>
      </form>
      {errorMessage && <p className="mt-2 text-sm text-red-600">{errorMessage}</p>}

      <div className="mt-6 space-y-6">
        {parts.length === 0 && <p className="text-zinc-600">No parts yet. Add one above.</p>}
        {CATEGORIES.map((c) => {
          const inCategory = parts.filter((p) => p.category === c.value);
          if (inCategory.length === 0) return null;
          return (
            <div key={c.value}>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">{c.label}</h2>
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
  const [quantity, setQuantity] = useState("1");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [entries, setEntries] = useState<PartStockEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  async function loadHistory() {
    setLoadingHistory(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("part_stock_entries")
      .select("id, part_id, entry_type, quantity, note, created_at")
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

  async function logEntry(entryType: "received" | "sold") {
    const qty = Number(quantity);
    if (!qty || qty < 1) return;
    setSaving(true);
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.from("part_stock_entries").insert({
      part_id: part.id,
      entry_type: entryType,
      quantity: qty,
      note: note || null,
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setQuantity("1");
      setNote("");
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium text-zinc-900">{part.name}</p>
          {part.stock_quantity <= 0 ? (
            <span className="inline-block rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
              Out of stock
            </span>
          ) : (
            <p className="text-sm text-zinc-500">{part.stock_quantity} in stock</p>
          )}
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-16 rounded border border-zinc-300 px-2 py-1 text-sm"
          />
          <input
            placeholder="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-36 rounded border border-zinc-300 px-2 py-1 text-sm"
          />
          <button
            onClick={() => logEntry("received")}
            disabled={saving}
            className="rounded border border-green-300 px-3 py-1 text-sm text-green-700 disabled:opacity-40"
          >
            + Add stock
          </button>
          <button
            onClick={() => logEntry("sold")}
            disabled={saving}
            className="rounded border border-red-300 px-3 py-1 text-sm text-red-600 disabled:opacity-40"
          >
            − Record sale
          </button>
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
          {entries.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between text-xs text-zinc-600">
              <span>
                <span className={entry.entry_type === "received" ? "text-green-700" : "text-red-600"}>
                  {entry.entry_type === "received" ? "+" : "-"}{entry.quantity}
                </span>
                {" "}
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
          ))}
        </div>
      )}
    </div>
  );
}
