"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="font-medium">{booking.full_name}</h2>
          <p className="text-sm text-zinc-500">
            {booking.phone} &middot; {booking.services?.name ?? "Unknown service"}
          </p>
        </div>
        <p className="text-sm text-zinc-500">
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
            className="mt-1 rounded border border-zinc-300 px-2 py-1 text-sm"
          >
            {BOOKING_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <button
          onClick={saveBookingStatus}
          disabled={savingBooking || bookingStatus === booking.status}
          className="rounded bg-black px-3 py-1 text-sm text-white disabled:opacity-40"
        >
          {savingBooking ? "Saving..." : "Save status"}
        </button>
      </div>

      <div className="mt-4 border-t border-zinc-100 pt-4">
        {!ticket ? (
          <button
            onClick={openTicket}
            disabled={savingTicket}
            className="rounded border border-zinc-300 px-3 py-1 text-sm disabled:opacity-40"
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
                className="mt-1 rounded border border-zinc-300 px-2 py-1 text-sm"
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
                className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
              />
            </div>
            <button
              onClick={saveTicket}
              disabled={savingTicket}
              className="rounded bg-black px-3 py-1 text-sm text-white disabled:opacity-40"
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
