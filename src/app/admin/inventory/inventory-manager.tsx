"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Trash2, ChevronDown, ChevronUp, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { InventoryItem } from "@/lib/types";

const STATUSES = ["available", "reserved", "sold"];
const MAX_PHOTOS = 3;

const emptyForm = {
  device_type: "",
  brand: "",
  model: "",
  condition_grade: "",
  price_rwf: "",
  storage_gb: "",
  status: "available",
};

function extOf(file: File) {
  const parts = file.name.split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "jpg";
}

function PartToggleRow({
  label,
  changed,
  onChangedChange,
  genuine,
  onGenuineChange,
}: {
  label: string;
  changed: boolean;
  onChangedChange: (v: boolean) => void;
  genuine: boolean;
  onGenuineChange: (v: boolean) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-md border border-zinc-200 px-3 py-2">
      <label className="flex items-center gap-2 text-sm text-zinc-700">
        <input type="checkbox" checked={changed} onChange={(e) => onChangedChange(e.target.checked)} />
        {label} replaced
      </label>
      {changed && (
        <div className="flex overflow-hidden rounded-md border border-zinc-300 text-xs">
          <button
            type="button"
            onClick={() => onGenuineChange(true)}
            className={`px-2 py-1 ${genuine ? "bg-brand-navy text-white" : "bg-white text-zinc-600"}`}
          >
            Genuine
          </button>
          <button
            type="button"
            onClick={() => onGenuineChange(false)}
            className={`px-2 py-1 ${!genuine ? "bg-brand-navy text-white" : "bg-white text-zinc-600"}`}
          >
            Aftermarket
          </button>
        </div>
      )}
    </div>
  );
}

export function InventoryManager({ items }: { items: InventoryItem[] }) {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [screenChanged, setScreenChanged] = useState(false);
  const [screenGenuine, setScreenGenuine] = useState(true);
  const [batteryChanged, setBatteryChanged] = useState(false);
  const [batteryGenuine, setBatteryGenuine] = useState(true);
  const [cameraChanged, setCameraChanged] = useState(false);
  const [cameraGenuine, setCameraGenuine] = useState(true);
  const [faceidWorking, setFaceidWorking] = useState("na");
  const [batteryHealthPercent, setBatteryHealthPercent] = useState("");
  const [adding, setAdding] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setErrorMessage("");

    const supabase = createClient();

    const photoUrls: string[] = [];
    for (const file of photoFiles.slice(0, MAX_PHOTOS)) {
      const path = `${crypto.randomUUID()}.${extOf(file)}`;
      const { error: uploadError } = await supabase.storage.from("repair-photos").upload(path, file);
      if (uploadError) {
        setErrorMessage(uploadError.message);
        setAdding(false);
        return;
      }
      photoUrls.push(supabase.storage.from("repair-photos").getPublicUrl(path).data.publicUrl);
    }

    const { error } = await supabase.from("inventory").insert({
      device_type: form.device_type,
      brand: form.brand,
      model: form.model,
      condition_grade: form.condition_grade,
      price_rwf: Number(form.price_rwf),
      status: form.status,
      storage_gb: form.storage_gb ? Number(form.storage_gb) : null,
      photo_urls: photoUrls.length > 0 ? photoUrls : null,
      screen_changed: screenChanged,
      screen_genuine: screenChanged ? screenGenuine : null,
      battery_changed: batteryChanged,
      battery_genuine: batteryChanged ? batteryGenuine : null,
      battery_health_percent: batteryHealthPercent ? Number(batteryHealthPercent) : null,
      camera_changed: cameraChanged,
      camera_genuine: cameraChanged ? cameraGenuine : null,
      faceid_working: faceidWorking === "na" ? null : faceidWorking === "yes",
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setForm(emptyForm);
      setPhotoFiles([]);
      setScreenChanged(false);
      setBatteryChanged(false);
      setCameraChanged(false);
      setFaceidWorking("na");
      setBatteryHealthPercent("");
      router.refresh();
    }
    setAdding(false);
  }

  return (
    <div className="mt-6">
      <form onSubmit={handleAdd} className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
          <input required placeholder="Device type" value={form.device_type}
            onChange={(e) => setForm({ ...form, device_type: e.target.value })}
            className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red sm:col-span-1" />
          <input required placeholder="Brand" value={form.brand}
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
            className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red sm:col-span-1" />
          <input required placeholder="Model" value={form.model}
            onChange={(e) => setForm({ ...form, model: e.target.value })}
            className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red sm:col-span-1" />
          <input required placeholder="Condition" value={form.condition_grade}
            onChange={(e) => setForm({ ...form, condition_grade: e.target.value })}
            className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red sm:col-span-1" />
          <input required type="number" placeholder="Price (RWF)" value={form.price_rwf}
            onChange={(e) => setForm({ ...form, price_rwf: e.target.value })}
            className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red sm:col-span-1" />
          <input type="number" min="1" placeholder="Storage (GB)" value={form.storage_gb}
            onChange={(e) => setForm({ ...form, storage_gb: e.target.value })}
            className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red sm:col-span-1" />
          <button type="submit" disabled={adding}
            className="flex items-center justify-center gap-1.5 rounded-md bg-brand-navy px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-navy/90 disabled:opacity-40 sm:col-span-1">
            <Plus size={15} />
            {adding ? "Adding..." : "Add device"}
          </button>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-500">Photos (up to {MAX_PHOTOS})</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setPhotoFiles(Array.from(e.target.files ?? []).slice(0, MAX_PHOTOS))}
            className="mt-1 w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-brand-navy/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand-navy hover:file:bg-brand-navy/20"
          />
          {photoFiles.length > 0 && (
            <p className="mt-1 text-xs text-zinc-500">{photoFiles.length} photo(s) selected</p>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-zinc-500">Parts replaced</p>
          <PartToggleRow label="Screen" changed={screenChanged} onChangedChange={setScreenChanged} genuine={screenGenuine} onGenuineChange={setScreenGenuine} />
          <PartToggleRow label="Battery" changed={batteryChanged} onChangedChange={setBatteryChanged} genuine={batteryGenuine} onGenuineChange={setBatteryGenuine} />
          <PartToggleRow label="Camera" changed={cameraChanged} onChangedChange={setCameraChanged} genuine={cameraGenuine} onGenuineChange={setCameraGenuine} />
        </div>

        <div className="flex flex-wrap gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-500">Battery health (%)</label>
            <input type="number" min="0" max="100" placeholder="e.g. 92" value={batteryHealthPercent}
              onChange={(e) => setBatteryHealthPercent(e.target.value)}
              className="mt-1 w-28 rounded-md border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500">Face ID</label>
            <select value={faceidWorking} onChange={(e) => setFaceidWorking(e.target.value)}
              className="mt-1 rounded-md border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red">
              <option value="na">N/A (no Face ID)</option>
              <option value="yes">Working</option>
              <option value="no">Not working</option>
            </select>
          </div>
        </div>
      </form>
      {errorMessage && <p className="mt-2 text-sm text-red-600">{errorMessage}</p>}

      <div className="mt-6 space-y-3">
        {items.length === 0 && <p className="text-zinc-600">No devices listed yet.</p>}
        {items.map((item) => (
          <InventoryRow key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function InventoryRow({ item }: { item: InventoryItem }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState(item.status);
  const [priceRwf, setPriceRwf] = useState(String(item.price_rwf));
  const [storageGb, setStorageGb] = useState(item.storage_gb?.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [photoUrls, setPhotoUrls] = useState(item.photo_urls ?? []);
  const [screenChanged, setScreenChanged] = useState(item.screen_changed);
  const [screenGenuine, setScreenGenuine] = useState(item.screen_genuine ?? true);
  const [batteryChanged, setBatteryChanged] = useState(item.battery_changed);
  const [batteryGenuine, setBatteryGenuine] = useState(item.battery_genuine ?? true);
  const [batteryHealthPercent, setBatteryHealthPercent] = useState(item.battery_health_percent?.toString() ?? "");
  const [cameraChanged, setCameraChanged] = useState(item.camera_changed);
  const [cameraGenuine, setCameraGenuine] = useState(item.camera_genuine ?? true);
  const [faceidWorking, setFaceidWorking] = useState(
    item.faceid_working === null ? "na" : item.faceid_working ? "yes" : "no"
  );

  async function save() {
    setSaving(true);
    setErrorMessage("");
    const supabase = createClient();
    const { error } = await supabase
      .from("inventory")
      .update({
        status,
        price_rwf: Number(priceRwf),
        storage_gb: storageGb ? Number(storageGb) : null,
      })
      .eq("id", item.id);

    if (error) {
      setErrorMessage(error.message);
    } else {
      router.refresh();
    }
    setSaving(false);
  }

  async function remove() {
    setSaving(true);
    setErrorMessage("");
    const supabase = createClient();
    const { error } = await supabase.from("inventory").delete().eq("id", item.id);

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
    } else {
      router.refresh();
    }
  }

  async function addPhotos(files: File[]) {
    if (files.length === 0) return;
    setSaving(true);
    setErrorMessage("");
    const supabase = createClient();

    const newUrls: string[] = [];
    for (const file of files.slice(0, MAX_PHOTOS - photoUrls.length)) {
      const path = `${crypto.randomUUID()}.${extOf(file)}`;
      const { error: uploadError } = await supabase.storage.from("repair-photos").upload(path, file);
      if (uploadError) {
        setErrorMessage(uploadError.message);
        setSaving(false);
        return;
      }
      newUrls.push(supabase.storage.from("repair-photos").getPublicUrl(path).data.publicUrl);
    }

    const updated = [...photoUrls, ...newUrls];
    const { error } = await supabase.from("inventory").update({ photo_urls: updated }).eq("id", item.id);
    if (error) {
      setErrorMessage(error.message);
    } else {
      setPhotoUrls(updated);
      router.refresh();
    }
    setSaving(false);
  }

  async function removePhoto(url: string) {
    setSaving(true);
    setErrorMessage("");
    const updated = photoUrls.filter((u) => u !== url);
    const supabase = createClient();
    const { error } = await supabase
      .from("inventory")
      .update({ photo_urls: updated.length > 0 ? updated : null })
      .eq("id", item.id);

    if (error) {
      setErrorMessage(error.message);
    } else {
      setPhotoUrls(updated);
      router.refresh();
    }
    setSaving(false);
  }

  async function saveCondition() {
    setSaving(true);
    setErrorMessage("");
    const supabase = createClient();
    const { error } = await supabase
      .from("inventory")
      .update({
        screen_changed: screenChanged,
        screen_genuine: screenChanged ? screenGenuine : null,
        battery_changed: batteryChanged,
        battery_genuine: batteryChanged ? batteryGenuine : null,
        camera_changed: cameraChanged,
        camera_genuine: cameraChanged ? cameraGenuine : null,
        battery_health_percent: batteryHealthPercent ? Number(batteryHealthPercent) : null,
        faceid_working: faceidWorking === "na" ? null : faceidWorking === "yes",
      })
      .eq("id", item.id);

    if (error) {
      setErrorMessage(error.message);
    } else {
      router.refresh();
    }
    setSaving(false);
  }

  const dirty =
    status !== item.status ||
    Number(priceRwf) !== item.price_rwf ||
    storageGb !== (item.storage_gb?.toString() ?? "");

  const STATUS_STYLES: Record<string, string> = {
    available: "bg-green-100 text-green-700",
    reserved: "bg-amber-100 text-amber-700",
    sold: "bg-zinc-100 text-zinc-600",
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[160px]">
          <div className="flex items-center gap-2">
            <p className="font-medium text-zinc-900">{item.brand} {item.model}</p>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[item.status] ?? "bg-zinc-100 text-zinc-600"}`}>
              {item.status}
            </span>
          </div>
          <p className="text-sm text-zinc-500">
            {item.device_type} &middot; Grade {item.condition_grade}
            {item.storage_gb != null && <> &middot; {item.storage_gb}GB</>}
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-500">Price (RWF)</label>
          <input type="number" value={priceRwf} onChange={(e) => setPriceRwf(e.target.value)}
            className="mt-1 w-28 rounded-md border border-zinc-300 px-2 py-1 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red" />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-500">Storage (GB)</label>
          <input type="number" min="1" value={storageGb} onChange={(e) => setStorageGb(e.target.value)}
            className="mt-1 w-24 rounded-md border border-zinc-300 px-2 py-1 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red" />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-500">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}
            className="mt-1 rounded-md border border-zinc-300 px-2 py-1 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red">
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <button onClick={save} disabled={saving || !dirty}
          className="rounded-md bg-brand-navy px-3 py-1 text-sm text-white transition-colors hover:bg-brand-navy/90 disabled:opacity-40">
          {saving ? "Saving..." : "Save"}
        </button>
        <button onClick={remove} disabled={saving}
          className="flex items-center gap-1.5 rounded-md border border-red-300 px-3 py-1 text-sm text-red-600 transition-colors hover:bg-red-50 disabled:opacity-40">
          <Trash2 size={14} />
          Delete
        </button>

        <button
          onClick={() => setExpanded(!expanded)}
          className="ml-auto flex items-center gap-1 text-xs font-medium text-brand-navy"
        >
          {expanded ? "Hide" : "Manage photos & condition"}
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-3 border-t border-zinc-100 pt-4">
          <div>
            <label className="block text-xs font-medium text-zinc-500">Photos ({photoUrls.length}/{MAX_PHOTOS})</label>
            <div className="mt-1 flex flex-wrap gap-2">
              {photoUrls.map((url) => (
                <div key={url} className="relative h-16 w-16">
                  <Image src={url} alt="" width={64} height={64} className="h-16 w-16 rounded-lg object-cover" />
                  <button
                    onClick={() => removePhoto(url)}
                    disabled={saving}
                    aria-label="Remove photo"
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {photoUrls.length < MAX_PHOTOS && (
                <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg border border-dashed border-zinc-300 text-zinc-400 hover:border-brand-navy hover:text-brand-navy">
                  <Plus size={18} />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={saving}
                    onChange={(e) => addPhotos(Array.from(e.target.files ?? []))}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-zinc-500">Parts replaced</p>
            <PartToggleRow label="Screen" changed={screenChanged} onChangedChange={setScreenChanged} genuine={screenGenuine} onGenuineChange={setScreenGenuine} />
            <PartToggleRow label="Battery" changed={batteryChanged} onChangedChange={setBatteryChanged} genuine={batteryGenuine} onGenuineChange={setBatteryGenuine} />
            <PartToggleRow label="Camera" changed={cameraChanged} onChangedChange={setCameraChanged} genuine={cameraGenuine} onGenuineChange={setCameraGenuine} />
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-500">Battery health (%)</label>
              <input type="number" min="0" max="100" value={batteryHealthPercent}
                onChange={(e) => setBatteryHealthPercent(e.target.value)}
                className="mt-1 w-24 rounded-md border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500">Face ID</label>
              <select value={faceidWorking} onChange={(e) => setFaceidWorking(e.target.value)}
                className="mt-1 rounded-md border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red">
                <option value="na">N/A (no Face ID)</option>
                <option value="yes">Working</option>
                <option value="no">Not working</option>
              </select>
            </div>
            <button
              onClick={saveCondition}
              disabled={saving}
              className="rounded-md bg-brand-navy px-3 py-1.5 text-sm text-white transition-colors hover:bg-brand-navy/90 disabled:opacity-40"
            >
              Save condition
            </button>
          </div>
        </div>
      )}

      {errorMessage && <p className="mt-2 text-sm text-red-600">{errorMessage}</p>}
    </div>
  );
}
