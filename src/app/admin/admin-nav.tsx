"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarClock, Smartphone, Wrench, Images, Package, BarChart3 } from "lucide-react";

const LINKS = [
  { href: "/admin/bookings", label: "Bookings", icon: CalendarClock },
  { href: "/admin/inventory", label: "Inventory", icon: Smartphone },
  { href: "/admin/services", label: "Services", icon: Wrench },
  { href: "/admin/showcases", label: "Showcases", icon: Images },
  { href: "/admin/parts", label: "Parts Stock", icon: Package },
  { href: "/admin/sales", label: "Sales", icon: BarChart3 },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 text-sm">
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active = pathname?.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-colors ${
              active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon size={15} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
