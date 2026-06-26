"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Phone as PhoneIcon, Wrench, CalendarClock, MessageSquare, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Service } from "@/lib/types";

const inputClass =
  "mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red";

const labelClass = "flex items-center gap-1.5 text-sm font-medium text-zinc-700";

export function BookingForm({
  services,
  initialServiceId,
}: {
  services: Service[];
  initialServiceId?: string;
}) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceId, setServiceId] = useState(
    services.some((s) => s.id === initialServiceId) ? initialServiceId! : services[0]?.id ?? ""
  );
  const [scheduledAt, setScheduledAt] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const supabase = createClient();
    const { data, error } = await supabase.rpc("create_booking", {
      p_full_name: fullName,
      p_phone: phone,
      p_service_id: serviceId,
      p_scheduled_at: new Date(scheduledAt).toISOString(),
      p_notes: notes || null,
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }

    setBookingId(data as string);
    setStatus("done");
  }

  if (status === "done" && bookingId) {
    return (
      <div>
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-700">
            <CheckCircle2 size={18} />
          </span>
          <p className="font-medium text-zinc-900">Booking confirmed</p>
        </div>
        <p className="mt-3 text-sm text-zinc-600">
          Save this booking ID, you&apos;ll need it with your phone number to track your repair status:
        </p>
        <code className="mt-2 block break-all rounded-md bg-zinc-50 border border-zinc-200 px-3 py-2 text-sm">
          {bookingId}
        </code>
        <Link
          href="/track-status"
          className="mt-4 inline-block text-sm font-medium text-brand-blue hover:underline"
        >
          Track your repair status &rarr;
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}><User size={14} className="text-brand-navy" /> Full name</label>
        <input
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}><PhoneIcon size={14} className="text-brand-navy" /> Phone number</label>
        <input
          required
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="07XXXXXXXX"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}><Wrench size={14} className="text-brand-navy" /> Service</label>
        <select
          required
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          className={inputClass}
        >
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} ({service.price_rwf.toLocaleString()} RWF)
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}><CalendarClock size={14} className="text-brand-navy" /> Preferred date & time</label>
        <input
          required
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}><MessageSquare size={14} className="text-brand-navy" /> Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={inputClass}
          rows={3}
        />
      </div>

      {status === "error" && <p className="text-sm text-red-600">{errorMessage}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-md px-4 py-2 font-semibold text-white bg-brand-red hover:bg-brand-red-dark transition-colors disabled:opacity-50"
      >
        {status === "submitting" ? "Booking..." : "Confirm booking"}
      </button>
    </form>
  );
}
