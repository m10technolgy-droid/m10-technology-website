import { createClient } from "@/lib/supabase/server";
import type { Booking, Ticket } from "@/lib/types";
import { BookingsTable } from "./bookings-table";

export default async function AdminBookingsPage() {
  const supabase = await createClient();

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("id, full_name, phone, service_id, scheduled_at, notes, status, services(name)")
    .order("scheduled_at", { ascending: false })
    .returns<Booking[]>();

  const { data: tickets } = await supabase
    .from("tickets")
    .select("id, booking_id, status, technician_notes")
    .returns<Ticket[]>();

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-zinc-900">Bookings</h1>
      <p className="mt-1 text-sm text-zinc-500">Incoming bookings and their repair tickets.</p>

      {error && <p className="mt-4 text-red-600">Could not load bookings: {error.message}</p>}

      {!error && (!bookings || bookings.length === 0) && (
        <p className="mt-4 text-zinc-600">No bookings yet.</p>
      )}

      {bookings && bookings.length > 0 && (
        <BookingsTable bookings={bookings} tickets={tickets ?? []} />
      )}
    </main>
  );
}
