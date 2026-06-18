export type Service = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  price_rwf: number;
  duration_minutes: number;
};

export type InventoryItem = {
  id: string;
  device_type: string;
  brand: string;
  model: string;
  condition_grade: string;
  price_rwf: number;
  photo_urls: string[] | null;
  status: string;
};

export type Category = {
  id: string;
  name: string;
};

export type Ticket = {
  id: string;
  booking_id: string;
  status: string;
  technician_notes: string | null;
};

export type Booking = {
  id: string;
  full_name: string;
  phone: string;
  service_id: string;
  scheduled_at: string;
  notes: string | null;
  status: string;
  services: { name: string } | null;
};
