export type Service = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  price_rwf: number;
  duration_minutes: number;
  image_path: string | null;
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
  screen_changed: boolean;
  screen_genuine: boolean | null;
  battery_changed: boolean;
  battery_genuine: boolean | null;
  camera_changed: boolean;
  camera_genuine: boolean | null;
  faceid_working: boolean | null;
};

export type Category = {
  id: string;
  name: string;
};

export type RepairShowcase = {
  id: string;
  title: string;
  description: string | null;
  before_image_path: string;
  after_image_path: string;
  is_published: boolean;
};

export type Ticket = {
  id: string;
  booking_id: string;
  status: string;
  technician_notes: string | null;
};

export type Part = {
  id: string;
  name: string;
  category: string;
  stock_quantity: number;
  selling_price_rwf: number | null;
  last_buy_price_rwf: number | null;
};

export type PartStockEntry = {
  id: string;
  part_id: string;
  entry_type: string;
  quantity: number;
  buy_price_rwf: number | null;
  selling_price_rwf: number | null;
  sale_price_rwf: number | null;
  cost_price_rwf: number | null;
  payment_method: string | null;
  payment_status: string | null;
  note: string | null;
  created_at: string;
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
