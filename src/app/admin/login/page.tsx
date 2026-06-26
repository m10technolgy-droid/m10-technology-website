"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }

    router.replace("/admin/bookings");
    router.refresh();
  }

  return (
    <main className="flex min-h-full flex-col items-center justify-center bg-zinc-50 px-6 py-16">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-navy text-white">
            <Lock size={20} />
          </span>
          <h1 className="mt-4 text-xl font-semibold text-zinc-900">M10 Staff Login</h1>
          <p className="mt-1 text-sm text-zinc-500">Sign in to manage the shop.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">Password</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
            />
          </div>

          {status === "error" && <p className="text-sm text-red-600">{errorMessage}</p>}

          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full rounded-md bg-brand-red px-4 py-2 font-semibold text-white transition-colors hover:bg-brand-red-dark disabled:opacity-50"
          >
            {status === "submitting" ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
