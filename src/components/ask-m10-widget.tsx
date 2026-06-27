"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { MessageCircleQuestion, X, Send } from "lucide-react";
import { matchQuery, type AskM10Result } from "@/lib/ask-m10";
import { createClient } from "@/lib/supabase/client";
import { StatusBadge } from "@/components/status-badge";
import type { Service, InventoryItem } from "@/lib/types";

const WHATSAPP_NUMBER = "250785757621";

const SUGGESTIONS = ["Cracked screen", "Battery dies fast", "Phone under 50,000 RWF", "Track my repair"];

type StatusResult = {
  booking_status: string;
  scheduled_at: string;
  service_name: string;
  ticket_status: string | null;
  technician_notes: string | null;
};

type Message =
  | { kind: "user"; id: string; text: string }
  | { kind: "bot-text"; id: string; text: string }
  | { kind: "answer"; id: string; result: AskM10Result }
  | { kind: "datetime-picker"; id: string; serviceId: string; serviceName: string; name: string; phone: string }
  | { kind: "booking-success"; id: string; bookingId: string; serviceName: string }
  | { kind: "booking-error"; id: string; error: string }
  | { kind: "status-result"; id: string; status: StatusResult | null };

type Flow =
  | { type: "idle" }
  | { type: "booking"; step: "name" | "phone" | "datetime"; serviceId: string; serviceName: string; name: string; phone: string }
  | { type: "status"; step: "bookingId" | "phone"; bookingId: string };

type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never;

let messageCounter = 0;
function nextId() {
  messageCounter += 1;
  return `m${messageCounter}`;
}

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [flow, setFlow] = useState<Flow>({ type: "idle" });

  if (pathname?.startsWith("/admin")) return null;

  function pushBot(message: DistributiveOmit<Message, "id">) {
    setMessages((m) => [...m, { ...message, id: nextId() } as Message]);
  }

  function startBooking(service: Service) {
    setMessages((m) => [...m, { kind: "user", id: nextId(), text: `Book ${service.name}` }]);
    setFlow({ type: "booking", step: "name", serviceId: service.id, serviceName: service.name, name: "", phone: "" });
    pushBot({ kind: "bot-text", text: "Great — what's your full name?" });
  }

  function startStatusFlow() {
    setFlow({ type: "status", step: "bookingId", bookingId: "" });
    pushBot({ kind: "bot-text", text: "Sure — what's your booking ID?" });
  }

  async function confirmBooking(
    serviceId: string,
    serviceName: string,
    name: string,
    phone: string,
    scheduledAt: string
  ): Promise<boolean> {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("create_booking", {
      p_full_name: name,
      p_phone: phone,
      p_service_id: serviceId,
      p_scheduled_at: new Date(scheduledAt).toISOString(),
      p_notes: null,
    });

    if (error) {
      pushBot({ kind: "booking-error", error: error.message });
      return false;
    }
    pushBot({ kind: "booking-success", bookingId: data as string, serviceName });
    setFlow({ type: "idle" });
    return true;
  }

  async function lookupStatus(bookingId: string, phone: string) {
    const supabase = createClient();
    const { data } = await supabase.rpc("get_booking_status", { p_booking_id: bookingId, p_phone: phone });
    const results = data as StatusResult[] | null;
    pushBot({ kind: "status-result", status: results && results.length > 0 ? results[0] : null });
  }

  function handleSend(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((m) => [...m, { kind: "user", id: nextId(), text: trimmed }]);
    setQuery("");

    if (flow.type === "booking") {
      if (flow.step === "name") {
        setFlow({ ...flow, step: "phone", name: trimmed });
        pushBot({ kind: "bot-text", text: "Thanks! What's your phone number?" });
        return;
      }
      if (flow.step === "phone") {
        const updated = { ...flow, step: "datetime" as const, phone: trimmed };
        setFlow(updated);
        pushBot({
          kind: "datetime-picker",
          serviceId: updated.serviceId,
          serviceName: updated.serviceName,
          name: updated.name,
          phone: updated.phone,
        });
        return;
      }
      return;
    }

    if (flow.type === "status") {
      if (flow.step === "bookingId") {
        setFlow({ ...flow, step: "phone", bookingId: trimmed });
        pushBot({ kind: "bot-text", text: "And the phone number used for that booking?" });
        return;
      }
      if (flow.step === "phone") {
        const bookingId = flow.bookingId;
        setFlow({ type: "idle" });
        lookupStatus(bookingId, trimmed);
        return;
      }
      return;
    }

    if (/track|status|where.*(repair|order|booking)/i.test(trimmed)) {
      startStatusFlow();
      return;
    }

    const result = matchQuery(trimmed, services, inventory);
    pushBot({ kind: "answer", result });
  }

  function handleSuggestion(text: string) {
    if (text === "Track my repair") {
      setMessages((m) => [...m, { kind: "user", id: nextId(), text }]);
      startStatusFlow();
      return;
    }
    handleSend(text);
  }

  const inputDisabled = flow.type === "booking" && flow.step === "datetime";
  const placeholder =
    flow.type === "booking"
      ? flow.step === "name" ? "Your full name" : "Your phone number"
      : flow.type === "status"
      ? flow.step === "bookingId" ? "Your booking ID" : "Phone number used for booking"
      : "e.g. cracked screen, iPhone 12";

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

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.length === 0 && (
              <div className="space-y-2">
                <p className="text-sm text-zinc-500">Try one of these, or type your own:</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSuggestion(s)}
                      className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-700 transition-colors hover:bg-zinc-100"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => {
              if (msg.kind === "user") {
                return (
                  <p key={msg.id} className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-brand-navy px-3 py-2 text-sm text-white">
                    {msg.text}
                  </p>
                );
              }
              if (msg.kind === "bot-text") {
                return (
                  <p key={msg.id} className="max-w-[90%] rounded-2xl rounded-bl-sm bg-zinc-100 px-3 py-2 text-sm text-zinc-800">
                    {msg.text}
                  </p>
                );
              }
              if (msg.kind === "answer") {
                return <AnswerBubble key={msg.id} result={msg.result} onBookService={startBooking} />;
              }
              if (msg.kind === "datetime-picker") {
                return (
                  <DateTimePickerBubble
                    key={msg.id}
                    serviceName={msg.serviceName}
                    onConfirm={(scheduledAt) =>
                      confirmBooking(msg.serviceId, msg.serviceName, msg.name, msg.phone, scheduledAt)
                    }
                  />
                );
              }
              if (msg.kind === "booking-success") {
                return <BookingSuccessBubble key={msg.id} bookingId={msg.bookingId} serviceName={msg.serviceName} />;
              }
              if (msg.kind === "booking-error") {
                return (
                  <p key={msg.id} className="max-w-[90%] rounded-2xl rounded-bl-sm bg-red-50 px-3 py-2 text-sm text-red-700">
                    Could not complete the booking: {msg.error}
                  </p>
                );
              }
              if (msg.kind === "status-result") {
                return <StatusResultBubble key={msg.id} status={msg.status} />;
              }
              return null;
            })}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(query);
            }}
            className="flex items-center gap-2 border-t border-zinc-100 p-3"
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={inputDisabled}
              placeholder={placeholder}
              className="flex-1 rounded-full border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red disabled:bg-zinc-50 disabled:text-zinc-400"
            />
            <button
              type="submit"
              disabled={inputDisabled}
              aria-label="Send"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-red text-white transition-colors hover:bg-brand-red-dark disabled:opacity-40"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function AnswerBubble({
  result,
  onBookService,
}: {
  result: AskM10Result;
  onBookService: (service: Service) => void;
}) {
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
              <button
                onClick={() => onBookService(service)}
                className="shrink-0 rounded-md bg-brand-red px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-brand-red-dark"
              >
                Book here
              </button>
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

function DateTimePickerBubble({
  serviceName,
  onConfirm,
}: {
  serviceName: string;
  onConfirm: (scheduledAt: string) => Promise<boolean>;
}) {
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div className="max-w-[90%] rounded-2xl rounded-bl-sm bg-zinc-100 px-3 py-2 text-sm text-zinc-800">
      <p>
        When would you like to come in for <span className="font-medium">{serviceName}</span>?
      </p>
      <input
        type="datetime-local"
        value={value}
        disabled={confirmed}
        onChange={(e) => setValue(e.target.value)}
        className="mt-2 w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red disabled:bg-zinc-50"
      />
      <button
        type="button"
        disabled={!value || submitting || confirmed}
        onClick={async () => {
          setSubmitting(true);
          const ok = await onConfirm(value);
          setSubmitting(false);
          if (ok) setConfirmed(true);
        }}
        className="mt-2 w-full rounded-md bg-brand-red px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-red-dark disabled:opacity-40"
      >
        {confirmed ? "Booked ✓" : submitting ? "Booking..." : "Confirm booking"}
      </button>
    </div>
  );
}

function BookingSuccessBubble({ bookingId, serviceName }: { bookingId: string; serviceName: string }) {
  return (
    <div className="max-w-[90%] space-y-1 rounded-2xl rounded-bl-sm bg-green-50 px-3 py-2 text-sm text-green-800">
      <p className="font-medium">Booked! {serviceName} is confirmed.</p>
      <p className="text-xs">
        Save this booking ID to track your repair: <code className="rounded bg-white px-1.5 py-0.5">{bookingId}</code>
      </p>
    </div>
  );
}

function StatusResultBubble({ status }: { status: StatusResult | null }) {
  if (!status) {
    return (
      <div className="max-w-[90%] rounded-2xl rounded-bl-sm bg-zinc-100 px-3 py-2 text-sm text-zinc-800">
        I couldn&apos;t find a booking with that ID and phone number. Double check them, or message us on{" "}
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-brand-blue hover:underline"
        >
          WhatsApp
        </a>
        .
      </div>
    );
  }

  return (
    <div className="max-w-[90%] space-y-2 rounded-2xl rounded-bl-sm bg-zinc-100 px-3 py-2 text-sm text-zinc-800">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-zinc-900">{status.service_name}</span>
        <StatusBadge status={status.booking_status} />
      </div>
      <p className="text-xs text-zinc-500">Scheduled: {new Date(status.scheduled_at).toLocaleString()}</p>
      {status.ticket_status && (
        <div className="flex items-center justify-between rounded-md bg-white px-2 py-1">
          <span className="text-xs text-zinc-600">Repair progress</span>
          <StatusBadge status={status.ticket_status} />
        </div>
      )}
      {status.technician_notes && (
        <p className="text-xs text-zinc-600">
          <span className="font-medium">Notes:</span> {status.technician_notes}
        </p>
      )}
    </div>
  );
}
