"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { MessageCircleQuestion, X, Send } from "lucide-react";
import { matchQuery, type AskM10Result } from "@/lib/ask-m10";
import type { Service, InventoryItem } from "@/lib/types";

const WHATSAPP_NUMBER = "250785757621";

const SUGGESTIONS = ["Cracked screen", "Battery dies fast", "Phone under 50,000 RWF"];

type Exchange = { query: string; result: AskM10Result };

export function AskM10Widget({
  services,
  inventory,
}: {
  services: Service[];
  inventory: InventoryItem[];
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState<Exchange[]>([]);

  if (pathname?.startsWith("/admin")) return null;

  function ask(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const result = matchQuery(trimmed, services, inventory);
    setHistory((h) => [...h, { query: trimmed, result }]);
    setQuery("");
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close Ask M10" : "Open Ask M10"}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-red text-white shadow-lg transition-transform hover:scale-105"
      >
        {open ? <X size={22} /> : <MessageCircleQuestion size={24} />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-40 flex max-h-[70vh] w-[92vw] max-w-sm flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl">
          <div className="bg-brand-navy px-4 py-3 text-white">
            <p className="font-semibold">Ask M10</p>
            <p className="text-xs text-white/70">Tell us what&apos;s wrong, or your budget for a device.</p>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-3">
            {history.length === 0 && (
              <div className="space-y-2">
                <p className="text-sm text-zinc-500">Try one of these, or type your own:</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => ask(s)}
                      className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-700 transition-colors hover:bg-zinc-100"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {history.map((exchange, i) => (
              <div key={i} className="space-y-2">
                <p className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-brand-navy px-3 py-2 text-sm text-white">
                  {exchange.query}
                </p>
                <AnswerBubble result={exchange.result} />
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(query);
            }}
            className="flex items-center gap-2 border-t border-zinc-100 p-3"
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. cracked screen, iPhone 12"
              className="flex-1 rounded-full border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
            />
            <button
              type="submit"
              aria-label="Send"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-red text-white transition-colors hover:bg-brand-red-dark"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function AnswerBubble({ result }: { result: AskM10Result }) {
  const hasAnything = result.services.length > 0 || result.inventory.length > 0;

  return (
    <div className="max-w-[90%] rounded-2xl rounded-bl-sm bg-zinc-100 px-3 py-2 text-sm text-zinc-800">
      {!hasAnything && (
        <p>
          I couldn&apos;t find an exact match. Browse{" "}
          <Link href="/services" className="font-medium text-brand-blue hover:underline">
            all services
          </Link>{" "}
          or message us on{" "}
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand-blue hover:underline"
          >
            WhatsApp
          </a>
          .
        </p>
      )}

      {result.services.length > 0 && (
        <div className="space-y-2">
          <p className="font-medium text-zinc-900">This might help:</p>
          {result.services.map(({ service }) => (
            <div
              key={service.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5"
            >
              <div>
                <p className="font-medium text-zinc-900">{service.name}</p>
                <p className="text-xs text-zinc-500">
                  {service.price_rwf.toLocaleString()} RWF &middot; ~{service.duration_minutes} min
                </p>
              </div>
              <Link
                href={`/booking?service=${service.id}`}
                className="shrink-0 rounded-md bg-brand-red px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-brand-red-dark"
              >
                Book
              </Link>
            </div>
          ))}
        </div>
      )}

      {result.inventory.length > 0 && (
        <div className={result.services.length > 0 ? "mt-3 space-y-2" : "space-y-2"}>
          <p className="font-medium text-zinc-900">
            {result.budgetRwf !== null ? "Devices around your budget:" : "Devices that match:"}
          </p>
          {result.inventory.map(({ item }) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5"
            >
              <div>
                <p className="font-medium text-zinc-900">
                  {item.brand} {item.model}
                </p>
                <p className="text-xs text-zinc-500">{item.price_rwf.toLocaleString()} RWF</p>
              </div>
              <Link
                href={`/inventory?highlight=${item.id}`}
                className="shrink-0 rounded-md bg-brand-navy px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-brand-navy/90"
              >
                View
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
