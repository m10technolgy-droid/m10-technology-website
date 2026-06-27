import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import { AskM10Widget } from "@/components/ask-m10-widget";
import type { Service, InventoryItem } from "@/lib/types";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "M10 Technology",
  description: "Device repair, second-hand devices, and online booking in Rubavu, Rwanda.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  const { data: services } = await supabase
    .from("services")
    .select("id, name, category, description, price_rwf, duration_minutes, image_path")
    .eq("is_active", true)
    .returns<Service[]>();

  const { data: inventory } = await supabase
    .from("inventory")
    .select(
      "id, device_type, brand, model, condition_grade, price_rwf, photo_urls, status, " +
      "screen_changed, screen_genuine, battery_changed, battery_genuine, camera_changed, camera_genuine, faceid_working, " +
      "storage_gb, battery_health_percent"
    )
    .eq("status", "available")
    .returns<InventoryItem[]>();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white">
        {children}
        <AskM10Widget services={services ?? []} inventory={inventory ?? []} />
      </body>
    </html>
  );
}
