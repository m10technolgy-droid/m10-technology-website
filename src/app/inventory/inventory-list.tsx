"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Laptop,
  Monitor,
  Smartphone,
  Wrench,
  ScanFace,
  BatteryMedium,
  MessageCircle,
  X,
} from "lucide-react";
import type { InventoryItem } from "@/lib/types";

const WHATSAPP_NUMBER = "250785757621";

function DeviceIconFallback({ deviceType, className }: { deviceType: string; className?: string }) {
  const type = deviceType.toLowerCase();
  if (type.includes("laptop")) return <Laptop className={className} strokeWidth={1.75} />;
  if (type.includes("desktop") || type.includes("tower") || type.includes("pc")) return <Monitor className={className} strokeWidth={1.75} />;
  if (type.includes("phone")) return <Smartphone className={className} strokeWidth={1.75} />;
  return <Wrench className={className} strokeWidth={1.75} />;
}

function whatsappLink(item: InventoryItem) {
  const message = `Hi! I'm interested in the ${item.brand} ${item.model} (${item.price_rwf.toLocaleString()} RWF) listed on your website.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function PartBadge({ label, genuine }: { label: string; genuine: boolean | null }) {
  if (genuine === null) return null;
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
        genuine ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
      }`}
    >
      {label}: {genuine ? "Genuine" : "Aftermarket"}
    </span>
  );
}

function PartRow({ label, genuine }: { label: string; genuine: boolean | null }) {
  if (genuine === null) return null;
  return (
    <li className="text-sm text-zinc-700">
      <span className="font-medium text-zinc-900">{label}</span> is replaced &mdash; quality:{" "}
      <span className={genuine ? "font-medium text-green-700" : "font-medium text-amber-700"}>
        {genuine ? "Genuine" : "Aftermarket"}
      </span>
    </li>
  );
}

function PartsConditionList({ item }: { item: InventoryItem }) {
  const anyChanged = item.screen_changed || item.battery_changed || item.camera_changed;
  const anyOther = item.battery_health_percent !== null || item.faceid_working !== null;

  if (!anyChanged && !anyOther) {
    return <p className="text-sm text-zinc-500">No parts have been replaced on this device.</p>;
  }

  return (
    <ul className="space-y-1.5">
      <PartRow label="Screen" genuine={item.screen_genuine} />
      <PartRow label="Battery" genuine={item.battery_genuine} />
      {item.battery_health_percent !== null && (
        <li className="text-sm text-zinc-700">
          <span className="font-medium text-zinc-900">Battery health</span>: {item.battery_health_percent}%
        </li>
      )}
      <PartRow label="Camera" genuine={item.camera_genuine} />
      {item.faceid_working !== null && (
        <li className="text-sm text-zinc-700">
          <span className="font-medium text-zinc-900">Face ID</span> is{" "}
          <span className={item.faceid_working ? "font-medium text-green-700" : "font-medium text-red-700"}>
            {item.faceid_working ? "working" : "not working"}
          </span>
        </li>
      )}
    </ul>
  );
}

function ConditionBadges({ item }: { item: InventoryItem }) {
  const hasAny =
    item.screen_changed || item.battery_changed || item.camera_changed ||
    item.faceid_working !== null || item.battery_health_percent !== null;
  if (!hasAny) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {item.screen_changed && <PartBadge label="Screen" genuine={item.screen_genuine} />}
      {item.battery_changed && <PartBadge label="Battery" genuine={item.battery_genuine} />}
      {item.battery_health_percent !== null && (
        <span className="flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700">
          <BatteryMedium size={12} />
          Battery health {item.battery_health_percent}%
        </span>
      )}
      {item.camera_changed && <PartBadge label="Camera" genuine={item.camera_genuine} />}
      {item.faceid_working !== null && (
        <span
          className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
            item.faceid_working ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          <ScanFace size={12} />
          Face ID {item.faceid_working ? "working" : "not working"}
        </span>
      )}
    </div>
  );
}

export function InventoryList({ items }: { items: InventoryItem[] }) {
  const [selected, setSelected] = useState<InventoryItem | null>(null);

  return (
    <>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((item) => {
          const photos = item.photo_urls ?? [];
          return (
            <li
              key={item.id}
              onClick={() => setSelected(item)}
              className="cursor-pointer rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                {photos.length > 0 ? (
                  <div className="flex shrink-0 -space-x-3">
                    {photos.slice(0, 3).map((url, i) => (
                      <Image
                        key={url}
                        src={url}
                        alt={`${item.brand} ${item.model}`}
                        width={56}
                        height={56}
                        className="h-14 w-14 rounded-lg border-2 border-white object-cover shadow-sm"
                        style={{ zIndex: 3 - i }}
                      />
                    ))}
                  </div>
                ) : (
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-navy/5 text-brand-navy">
                    <DeviceIconFallback deviceType={item.device_type} className="h-6 w-6" />
                  </span>
                )}
                <div className="flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <h2 className="font-medium text-zinc-900">
                      {item.brand} {item.model}
                    </h2>
                    <span className="text-sm font-semibold whitespace-nowrap text-brand-red">
                      {item.price_rwf.toLocaleString()} RWF
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-500 capitalize">
                    {item.device_type}
                    {item.storage_gb != null && <> &middot; {item.storage_gb}GB</>}
                  </p>
                  <span className="mt-2 inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 capitalize">
                    Grade {item.condition_grade}
                  </span>
                </div>
              </div>

              <div className="mt-3 space-y-3 border-t border-zinc-100 pt-3">
                <ConditionBadges item={item} />
                <a
                  href={whatsappLink(item)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700"
                >
                  <MessageCircle size={16} />
                  Buy via WhatsApp
                </a>
              </div>
            </li>
          );
        })}
      </ul>

      {selected && <DetailModal item={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

function DetailModal({ item, onClose }: { item: InventoryItem; onClose: () => void }) {
  const photos = item.photo_urls ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-zinc-900">
            {item.brand} {item.model}
          </h3>
          <button onClick={onClose} aria-label="Close" className="text-zinc-400 hover:text-zinc-700">
            <X size={20} />
          </button>
        </div>

        {photos.length > 0 ? (
          <div className="mt-4 grid grid-cols-3 gap-2">
            {photos.map((url) => (
              <div key={url} className="relative aspect-square overflow-hidden rounded-lg">
                <Image src={url} alt={`${item.brand} ${item.model}`} fill className="object-cover" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 flex h-32 items-center justify-center rounded-lg bg-brand-navy/5 text-brand-navy">
            <DeviceIconFallback deviceType={item.device_type} className="h-10 w-10" />
          </div>
        )}

        <div className="mt-4 flex items-baseline justify-between gap-3">
          <p className="text-sm text-zinc-500 capitalize">
            {item.device_type}
            {item.storage_gb != null && <> &middot; {item.storage_gb}GB</>}
            {" "}&middot; Grade {item.condition_grade}
          </p>
          <span className="whitespace-nowrap text-lg font-semibold text-brand-red">
            {item.price_rwf.toLocaleString()} RWF
          </span>
        </div>

        <div className="mt-4 border-t border-zinc-100 pt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Parts &amp; condition</p>
          <div className="mt-2">
            <PartsConditionList item={item} />
          </div>
        </div>

        <a
          href={whatsappLink(item)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700"
        >
          <MessageCircle size={18} />
          Buy via WhatsApp
        </a>
      </div>
    </div>
  );
}
