"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { RepairShowcase } from "@/lib/types";

type AdminShowcase = RepairShowcase & { beforeUrl: string; afterUrl: string };

function extOf(file: File) {
  const parts = file.name.split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "jpg";
}

export function ShowcasesManager({ showcases }: { showcases: AdminShowcase[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!beforeFile || !afterFile) return;
    setUploading(true);
    setErrorMessage("");

    const supabase = createClient();
    const beforePath = `${crypto.randomUUID()}.${extOf(beforeFile)}`;
    const afterPath = `${crypto.randomUUID()}.${extOf(afterFile)}`;

    const { error: beforeError } = await supabase.storage
      .from("repair-photos")
      .upload(beforePath, beforeFile);
    if (beforeError) {
      setErrorMessage(beforeError.message);
      setUploading(false);
      return;
    }

    const { error: afterError } = await supabase.storage
      .from("repair-photos")
      .upload(afterPath, afterFile);
    if (afterError) {
      setErrorMessage(afterError.message);
      setUploading(false);
      return;
    }

    const { error: insertError } = await supabase.from("repair_showcases").insert({
      title,
      description: description || null,
      before_image_path: beforePath,
      after_image_path: afterPath,
      is_published: true,
    });

    if (insertError) {
      setErrorMessage(insertError.message);
    } else {
      setTitle("");
      setDescription("");
      setBeforeFile(null);
      setAfterFile(null);
      router.refresh();
    }
    setUploading(false);
  }

  return (
    <div className="mt-6">
      <form onSubmit={handleAdd} className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <input
          required
          placeholder="Title (e.g. iPhone 12 Screen Replacement)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
        />
        <textarea
          placeholder="Description (optional) - what was wrong and what you fixed"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-zinc-500">Before photo</label>
            <input
              required
              type="file"
              accept="image/*"
              onChange={(e) => setBeforeFile(e.target.files?.[0] ?? null)}
              className="mt-1 w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-brand-navy/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand-navy hover:file:bg-brand-navy/20"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500">After photo</label>
            <input
              required
              type="file"
              accept="image/*"
              onChange={(e) => setAfterFile(e.target.files?.[0] ?? null)}
              className="mt-1 w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-brand-navy/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand-navy hover:file:bg-brand-navy/20"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={uploading}
          className="flex items-center gap-1.5 rounded-md bg-brand-navy px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-navy/90 disabled:opacity-40"
        >
          <Upload size={15} />
          {uploading ? "Uploading..." : "Add to showcase"}
        </button>
      </form>
      {errorMessage && <p className="mt-2 text-sm text-red-600">{errorMessage}</p>}

      <div className="mt-6 space-y-3">
        {showcases.length === 0 && <p className="text-zinc-600">No showcases yet.</p>}
        {showcases.map((showcase) => (
          <ShowcaseRow key={showcase.id} showcase={showcase} />
        ))}
      </div>
    </div>
  );
}

function ShowcaseRow({ showcase }: { showcase: AdminShowcase }) {
  const router = useRouter();
  const [isPublished, setIsPublished] = useState(showcase.is_published);
  const [description, setDescription] = useState(showcase.description ?? "");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function togglePublished(value: boolean) {
    setIsPublished(value);
    setSaving(true);
    setErrorMessage("");
    const supabase = createClient();
    const { error } = await supabase
      .from("repair_showcases")
      .update({ is_published: value })
      .eq("id", showcase.id);

    if (error) {
      setErrorMessage(error.message);
      setIsPublished(!value);
    } else {
      router.refresh();
    }
    setSaving(false);
  }

  async function saveDescription() {
    setSaving(true);
    setErrorMessage("");
    const supabase = createClient();
    const { error } = await supabase
      .from("repair_showcases")
      .update({ description: description || null })
      .eq("id", showcase.id);

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
    await supabase.storage
      .from("repair-photos")
      .remove([showcase.before_image_path, showcase.after_image_path]);
    const { error } = await supabase.from("repair_showcases").delete().eq("id", showcase.id);

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
    } else {
      router.refresh();
    }
  }

  const descriptionDirty = description !== (showcase.description ?? "");

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          <Image src={showcase.beforeUrl} alt="Before" width={64} height={64} className="h-16 w-16 rounded-lg object-cover" />
          <Image src={showcase.afterUrl} alt="After" width={64} height={64} className="h-16 w-16 rounded-lg object-cover" />
        </div>
        <p className="flex-1 font-medium text-zinc-900 min-w-[150px]">{showcase.title}</p>

        <label className="flex items-center gap-2 text-sm text-zinc-700">
          <input
            type="checkbox"
            checked={isPublished}
            disabled={saving}
            onChange={(e) => togglePublished(e.target.checked)}
          />
          Published
        </label>

        <button
          onClick={remove}
          disabled={saving}
          className="flex items-center gap-1.5 rounded-md border border-red-300 px-3 py-1 text-sm text-red-600 transition-colors hover:bg-red-50 disabled:opacity-40"
        >
          <Trash2 size={14} />
          Delete
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-start gap-2 border-t border-zinc-100 pt-3">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional) - what was wrong and what you fixed"
          rows={2}
          className="flex-1 min-w-[200px] rounded-md border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
        />
        <button
          onClick={saveDescription}
          disabled={saving || !descriptionDirty}
          className="rounded-md bg-brand-navy px-3 py-1.5 text-sm text-white transition-colors hover:bg-brand-navy/90 disabled:opacity-40"
        >
          {saving ? "Saving..." : "Save description"}
        </button>
      </div>

      {errorMessage && <p className="mt-2 text-sm text-red-600">{errorMessage}</p>}
    </div>
  );
}
