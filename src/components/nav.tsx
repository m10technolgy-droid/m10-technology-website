import Link from "next/link";
import Image from "next/image";

export function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-zinc-200 shadow-sm">
      <div className="mx-auto max-w-6xl px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="M10 Technology" width={40} height={40} />
          <span className="font-bold text-[#1D4ED8] text-lg hidden sm:block">M10 Technology</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/services"
            className="px-3 py-2 text-sm font-medium text-zinc-700 hover:text-[#C0223B] transition-colors"
          >
            Services
          </Link>
          <Link
            href="/inventory"
            className="px-3 py-2 text-sm font-medium text-zinc-700 hover:text-[#C0223B] transition-colors"
          >
            Devices
          </Link>
          <Link
            href="/track-status"
            className="px-3 py-2 text-sm font-medium text-zinc-700 hover:text-[#C0223B] transition-colors hidden sm:block"
          >
            Track Repair
          </Link>
          <Link
            href="/booking"
            className="ml-2 px-4 py-2 text-sm font-semibold text-white rounded-md"
            style={{ backgroundColor: "#C0223B" }}
          >
            Book a Repair
          </Link>
        </nav>
      </div>
    </header>
  );
}
