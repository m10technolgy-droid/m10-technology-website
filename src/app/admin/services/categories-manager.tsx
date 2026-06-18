"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <h2 className="font-medium text-zinc-900">Categories</h2>

      <div className="mt-3 flex flex-wrap gap-2">
        {categories.length === 0 && <p className="text-sm text-zinc-500">No categories yet.</p>}
        {categories.map((category) => (
          <span
            key={category.id}
            className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-sm"
          >
            {category.name}
            <button
              onClick={() => remove(category.id)}
              className="text-zinc-400 hover:text-red-600"
              aria-label={`Remove ${category.name}`}
            >
              &times;
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
          className="flex-1 rounded border border-zinc-300 px-2 py-1 text-sm"
        />
        <button
          type="submit"
          disabled={adding}
          className="rounded bg-black px-3 py-1 text-sm text-white disabled:opacity-40"
        >
          {adding ? "Adding..." : "Add category"}
        </button>
      </form>
      {errorMessage && <p className="mt-2 text-sm text-red-600">{errorMessage}</p>}
    </div>
  );
}
