"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { apiFetch } from "@/lib/api";

export default function SecuritySettingsPage() {
  const router = useRouter();
  const [qrCodeDataUri, setQrCodeDataUri] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function enableMfa() {
    try {
      const data = await apiFetch("/mfa/enable", { method: "POST" });
      setQrCodeDataUri(data.qr_code_data_uri || "");
      setSecret(data.secret || "");
      setMessage(data.message || "MFA setup ready.");
    } catch (err) {
      setError(err.message);
    }
  }

  async function verifyMfa() {
    try {
      const data = await apiFetch("/mfa/verify", {
        method: "POST",
        body: JSON.stringify({ code }),
      });
      setMessage(data.message || "MFA enabled.");
    } catch (err) {
      setError(err.message);
    }
  }

  async function disableMfa() {
    try {
      const data = await apiFetch("/mfa/disable", {
        method: "POST",
        body: JSON.stringify({ code, password }),
      });
      setMessage(data.message || "MFA disabled.");
      setQrCodeDataUri("");
      setSecret("");
      setCode("");
      setPassword("");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Security</p>
            <h1 className="mt-2 text-3xl font-bold">Multi-factor authentication</h1>
          </div>
          <button onClick={() => router.push("/dashboard")} className="rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:border-slate-500">Back to dashboard</button>
        </div>

        <div className="mt-6 space-y-4">
          <button onClick={enableMfa} className="rounded-xl bg-cyan-500 px-4 py-3 font-medium text-slate-950 hover:bg-cyan-400">Generate MFA setup</button>
          {qrCodeDataUri ? (
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-4">
              <p className="mb-2 text-sm text-slate-300">Authenticator setup</p>
              <Image src={qrCodeDataUri} alt="MFA QR code" width={220} height={220} unoptimized className="mx-auto rounded-lg bg-white p-2" />
              <p className="mt-3 break-all text-xs text-slate-400">Secret: {secret}</p>
            </div>
          ) : null}

          <label className="block">
            <span className="mb-1 block text-sm text-slate-300">Verification code</span>
            <input type="text" maxLength={6} value={code} onChange={(event) => setCode(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 outline-none focus:border-cyan-400" />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-slate-300">Current password to disable MFA</span>
            <input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 outline-none focus:border-cyan-400" />
          </label>

          <div className="flex gap-3">
            <button onClick={verifyMfa} className="rounded-xl bg-emerald-500 px-4 py-3 font-medium text-slate-950 hover:bg-emerald-400">Verify MFA</button>
            <button onClick={disableMfa} className="rounded-xl border border-red-500/60 px-4 py-3 font-medium text-red-200 hover:bg-red-500/10">Disable MFA</button>
          </div>

          {message ? <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{message}</p> : null}
          {error ? <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p> : null}
        </div>
      </div>
    </main>
  );
}
