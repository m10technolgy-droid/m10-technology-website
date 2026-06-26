"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, Calendar, ClipboardList } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { StatusBadge } from "@/components/status-badge";
import type { Booking, Ticket } from "@/lib/types";

const BOOKING_STATUSES = ["pending", "confirmed", "in_progress", "completed", "cancelled"];
const TICKET_STATUSES = ["not_started", "in_progress", "ready_for_pickup", "completed"];

export function BookingsTable({
  bookings,
  tickets,
}: {
  bookings: Booking[];
  tickets: Ticket[];
}) {
  const ticketsByBooking = new Map(tickets.map((t) => [t.booking_id, t]));

  return (
    <div className="mt-6 space-y-4">
      {bookings.map((booking) => (
        <BookingRow key={booking.id} booking={booking} ticket={ticketsByBooking.get(booking.id)} />
      ))}
    </div>
  );
}

function BookingRow({ booking, ticket }: { booking: Booking; ticket: Ticket | undefined }) {
  const router = useRouter();
  const [bookingStatus, setBookingStatus] = useState(booking.status);
  const [ticketStatus, setTicketStatus] = useState(ticket?.status ?? "not_started");
  const [technicianNotes, setTechnicianNotes] = useState(ticket?.technician_notes ?? "");
  const [savingBooking, setSavingBooking] = useState(false);
  const [savingTicket, setSavingTicket] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function saveBookingStatus() {
    setSavingBooking(true);
    setErrorMessage("");
    const supabase = createClient();
    const { error } = await supabase
      .from("bookings")
      .update({ status: bookingStatus })
      .eq("id", booking.id);

    if (error) {
      setErrorMessage(error.message);
    } else {
      router.refresh();
    }
    setSavingBooking(false);
  }

  async function openTicket() {
    setSavingTicket(true);
    setErrorMessage("");
    const supabase = createClient();
    const { error } = await supabase.from("tickets").insert({ booking_id: booking.id });

    if (error) {
      setErrorMessage(error.message);
    } else {
      router.refresh();
    }
    setSavingTicket(false);
  }

  async function saveTicket() {
    if (!ticket) return;
    setSavingTicket(true);
    setErrorMessage("");
    const supabase = createClient();
    const { error } = await supabase
      .from("tickets")
      .update({ status: ticketStatus, technician_notes: technicianNotes || null })
      .eq("id", ticket.id);

    if (error) {
      setErrorMessage(error.message);
    } else {
      router.refresh();
    }
    setSavingTicket(false);
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-medium text-zinc-900">{booking.full_name}</h2>
            <StatusBadge status={bookingStatus} />
          </div>
          <p className="mt-1 flex items-center gap-3 text-sm text-zinc-500">
            <span className="flex items-center gap-1"><Phone size={13} /> {booking.phone}</span>
            <span className="flex items-center gap-1"><ClipboardList size={13} /> {booking.services?.name ?? "Unknown service"}</span>
          </p>
        </div>
        <p className="flex items-center gap-1 text-sm text-zinc-500">
          <Calendar size={13} />
          {new Date(booking.scheduled_at).toLocaleString()}
        </p>
      </div>

      {booking.notes && <p className="mt-2 text-sm text-zinc-600">Note: {booking.notes}</p>}

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-zinc-500">Booking status</label>
          <select
            value={bookingStatus}
            onChange={(e) => setBookingStatus(e.target.value)}
            className="mt-1 rounded-md border border-zinc-300 px-2 py-1 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
          >
            {BOOKING_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <button
          onClick={saveBookingStatus}
          disabled={savingBooking || bookingStatus === booking.status}
          className="rounded-md bg-brand-navy px-3 py-1 text-sm text-white transition-colors hover:bg-brand-navy/90 disabled:opacity-40"
        >
          {savingBooking ? "Saving..." : "Save status"}
        </button>
      </div>

      <div className="mt-4 border-t border-zinc-100 pt-4">
        {!ticket ? (
          <button
            onClick={openTicket}
            disabled={savingTicket}
            className="rounded-md border border-zinc-300 px-3 py-1 text-sm transition-colors hover:border-brand-navy hover:text-brand-navy disabled:opacity-40"
          >
            {savingTicket ? "Opening..." : "Open repair ticket"}
          </button>
        ) : (
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-500">Ticket status</label>
              <select
                value={ticketStatus}
                onChange={(e) => setTicketStatus(e.target.value)}
                className="mt-1 rounded-md border border-zinc-300 px-2 py-1 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
              >
                {TICKET_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-zinc-500">Technician notes</label>
              <input
                value={technicianNotes}
                onChange={(e) => setTechnicianNotes(e.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
              />
            </div>
            <button
              onClick={saveTicket}
              disabled={savingTicket}
              className="rounded-md bg-brand-navy px-3 py-1 text-sm text-white transition-colors hover:bg-brand-navy/90 disabled:opacity-40"
            >
              {savingTicket ? "Saving..." : "Save ticket"}
            </button>
          </div>
        )}
      </div>

      {errorMessage && <p className="mt-2 text-sm text-red-600">{errorMessage}</p>}
    </div>
  );
}
