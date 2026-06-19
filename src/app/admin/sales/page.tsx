"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type SoldEntry = {
  id: string;
  quantity: number;
  sale_price_rwf: number | null;
  cost_price_rwf: number | null;
  note: string | null;
  created_at: string;
  parts: { name: string } | null;
};

type Period = "daily" | "weekly" | "monthly";

const PERIODS: { value: Period; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

function getStartDate(period: Period): Date {
  const now = new Date();
  if (period === "daily") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  if (period === "weekly") {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const day = start.getDay();
    const sinceMonday = day === 0 ? 6 : day - 1;
    start.setDate(start.getDate() - sinceMonday);
    return start;
  }
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export default function AdminSalesPage() {
  const [period, setPeriod] = useState<Period>("daily");
  const [entries, setEntries] = useState<SoldEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setErrorMessage("");

    const supabase = createClient();
    supabase
      .from("part_stock_entries")
      .select("id, quantity, sale_price_rwf, cost_price_rwf, note, created_at, parts(name)")
      .eq("entry_type", "sold")
      .gte("created_at", getStartDate(period).toISOString())
      .order("created_at", { ascending: false })
      .returns<SoldEntry[]>()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) setErrorMessage(error.message);
        setEntries(data ?? []);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [period]);

  const totalSelling = entries.reduce((sum, e) => sum + e.quantity * (e.sale_price_rwf ?? 0), 0);
  const totalProfit = entries.reduce((sum, e) => {
    if (e.sale_price_rwf == null || e.cost_price_rwf == null) return sum;
    return sum + e.quantity * (e.sale_price_rwf - e.cost_price_rwf);
  }, 0);

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Sales</h1>
      <p className="mt-1 text-sm text-zinc-500">Total selling and profit from parts sold.</p>

      <div className="mt-6 inline-flex rounded-lg border border-zinc-200 bg-white p-1">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              period === p.value ? "bg-brand-navy text-white" : "text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Total selling</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900">{totalSelling.toLocaleString()} RWF</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Total profit</p>
          <p className="mt-1 text-2xl font-bold text-green-700">{totalProfit.toLocaleString()} RWF</p>
        </div>
      </div>

      {errorMessage && <p className="mt-4 text-sm text-red-600">{errorMessage}</p>}

      <div className="mt-6 space-y-2">
        {loading && <p className="text-sm text-zinc-400">Loading...</p>}
        {!loading && entries.length === 0 && (
          <p className="text-sm text-zinc-600">No sales in this period.</p>
        )}
        {!loading && entries.map((entry) => {
          const lineTotal = entry.quantity * (entry.sale_price_rwf ?? 0);
          const lineProfit =
            entry.sale_price_rwf != null && entry.cost_price_rwf != null
              ? entry.quantity * (entry.sale_price_rwf - entry.cost_price_rwf)
              : null;
          return (
            <div
              key={entry.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white p-3 text-sm"
            >
              <div>
                <p className="font-medium text-zinc-900">{entry.parts?.name ?? "Unknown part"}</p>
                <p className="text-xs text-zinc-500">
                  {entry.quantity} &times; {(entry.sale_price_rwf ?? 0).toLocaleString()} RWF
                  {" "}&middot;{" "}
                  {new Date(entry.created_at).toLocaleString()}
                  {entry.note && <span> &middot; {entry.note}</span>}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-zinc-900">{lineTotal.toLocaleString()} RWF</p>
                {lineProfit != null && (
                  <p className="text-xs text-green-700">+{lineProfit.toLocaleString()} profit</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
