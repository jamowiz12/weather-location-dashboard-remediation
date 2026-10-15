"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/lib/api";

export default function MfaPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiFetch("/mfa/challenge", {
        method: "POST",
        body: JSON.stringify({ code }),
      });

      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Two-factor verification</p>
        <h1 className="mt-2 text-3xl font-bold">Enter your MFA code</h1>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1 block text-sm text-slate-300">Authentication code</span>
            <input type="text" inputMode="numeric" maxLength={6} value={code} onChange={(event) => setCode(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-center text-xl tracking-[0.4em] outline-none focus:border-cyan-400" required />
          </label>

          {error ? <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p> : null}

          <button type="submit" disabled={loading} className="w-full rounded-xl bg-cyan-500 px-4 py-3 font-medium text-slate-950 hover:bg-cyan-400 disabled:opacity-60">
            {loading ? "Verifying..." : "Verify code"}
          </button>
        </form>
      </div>
    </main>
  );
}
