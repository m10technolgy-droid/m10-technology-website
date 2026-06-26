import { createClient } from "@/lib/supabase/server";
import type { RepairShowcase } from "@/lib/types";
import { ShowcasesManager } from "./showcases-manager";

export default async function AdminShowcasesPage() {
  const supabase = await createClient();

  const { data: showcases, error } = await supabase
    .from("repair_showcases")
    .select("id, title, before_image_path, after_image_path, is_published")
    .order("created_at", { ascending: false })
    .returns<RepairShowcase[]>();

  const withUrls = (showcases ?? []).map((s) => ({
    ...s,
    beforeUrl: supabase.storage.from("repair-photos").getPublicUrl(s.before_image_path).data.publicUrl,
    afterUrl: supabase.storage.from("repair-photos").getPublicUrl(s.after_image_path).data.publicUrl,
  }));

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-zinc-900">Recent Repairs Showcase</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Upload before/after photos to feature on the homepage slideshow.
      </p>

      {error && <p className="mt-4 text-red-600">Could not load showcases: {error.message}</p>}

      <ShowcasesManager showcases={withUrls} />
    </main>
  );
}
