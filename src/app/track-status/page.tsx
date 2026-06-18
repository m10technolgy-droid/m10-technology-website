"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";

type StatusResult = {
  booking_status: string;
  scheduled_at: string;
  service_name: string;
  ticket_status: string | null;
  technician_notes: string | null;
};

const inputClass =
  "mt-1 w-full rounded border border-zinc-300 px-3 py-2 outline-none focus:border-[#C0223B] focus:ring-1 focus:ring-[#C0223B]";

export default function TrackStatusPage() {
  const [bookingId, setBookingId] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<StatusResult | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error" | "not_found">(
    "idle"
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setResult(null);

    const supabase = createClient();
    const { data, error } = await supabase.rpc("get_booking_status", {
      p_booking_id: bookingId,
      p_phone: phone,
    });

    if (error) {
      setStatus("error");
      return;
    }

    if (!data || data.length === 0) {
      setStatus("not_found");
      return;
    }

    setResult(data[0]);
    setStatus("done");
  }

  return (
    <div className="min-h-full flex flex-col">
      <Nav />
      <PageHeader
        title="Track Your Repair"
        subtitle="Enter your booking ID and phone number to see the latest status."
      />

      <main className="mx-auto max-w-xl px-6 py-12 flex-1 w-full">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Booking ID</label>
              <input
                required
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Phone number</label>
              <input
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-md px-4 py-2 font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: "#C0223B" }}
            >
              {status === "loading" ? "Checking..." : "Check status"}
            </button>
          </form>

          {status === "not_found" && (
            <p className="mt-6 text-sm text-red-600">
              No booking found with that ID and phone number.
            </p>
          )}
          {status === "error" && (
            <p className="mt-6 text-sm text-red-600">Something went wrong. Try again.</p>
          )}

          {result && (
            <div className="mt-6 border-t border-zinc-100 pt-6">
              <div className="flex items-baseline justify-between">
                <p className="font-medium text-zinc-900">{result.service_name}</p>
                <StatusBadge status={result.booking_status} />
              </div>
              <p className="mt-2 text-sm text-zinc-600">
                Scheduled: {new Date(result.scheduled_at).toLocaleString()}
              </p>

              {result.ticket_status && (
                <div className="mt-4 flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2">
                  <span className="text-sm text-zinc-600">Repair progress</span>
                  <StatusBadge status={result.ticket_status} />
                </div>
              )}
              {result.technician_notes && (
                <p className="mt-3 text-sm text-zinc-600">
                  <span className="font-medium">Technician notes:</span> {result.technician_notes}
                </p>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
