import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-zinc-900 text-zinc-400 py-10 px-6 mt-auto">
      <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="M10 Technology" width={32} height={32} className="brightness-0 invert opacity-70" />
          <span className="text-sm">M10 Technology &mdash; Ubuntu House, 2nd Floor, Rubavu, Rwanda</span>
        </div>
        <div className="text-sm">
          <a href="tel:+250785757621" className="hover:text-white transition-colors">+250 785 757 621</a>
          <span className="mx-2">·</span>
          <span>Mon – Sun, 8 AM – 9 PM</span>
        </div>
      </div>
    </footer>
  );
}
