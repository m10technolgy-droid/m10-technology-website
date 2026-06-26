"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tag, X, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/lib/types";

export function CategoriesManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.from("categories").insert({ name });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setName("");
      router.refresh();
    }
    setAdding(false);
  }

  async function remove(id: string) {
    setErrorMessage("");
    const supabase = createClient();
    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      setErrorMessage(error.message);
    } else {
      router.refresh();
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <h2 className="flex items-center gap-1.5 font-medium text-zinc-900">
        <Tag size={16} className="text-brand-navy" />
        Categories
      </h2>

      <div className="mt-3 flex flex-wrap gap-2">
        {categories.length === 0 && <p className="text-sm text-zinc-500">No categories yet.</p>}
        {categories.map((category) => (
          <span
            key={category.id}
            className="inline-flex items-center gap-2 rounded-full border border-brand-navy/10 bg-brand-navy/5 px-3 py-1 text-sm text-brand-navy"
          >
            {category.name}
            <button
              onClick={() => remove(category.id)}
              className="text-brand-navy/40 hover:text-red-600"
              aria-label={`Remove ${category.name}`}
            >
              <X size={13} />
            </button>
          </span>
        ))}
      </div>

      <form onSubmit={handleAdd} className="mt-3 flex gap-2">
        <input
          required
          placeholder="New category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-md border border-zinc-300 px-2 py-1 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
        />
        <button
          type="submit"
          disabled={adding}
          className="flex items-center gap-1.5 rounded-md bg-brand-navy px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-brand-navy/90 disabled:opacity-40"
        >
          <Plus size={14} />
          {adding ? "Adding..." : "Add category"}
        </button>
      </form>
      {errorMessage && <p className="mt-2 text-sm text-red-600">{errorMessage}</p>}
    </div>
  );
}
