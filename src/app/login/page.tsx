"use client";
import { loginPlatform, platformMe } from "@/lib/api";

import { useEffect, useState } from "react";

export default function LoginPage() {
  const [next, setNext] = useState("/");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const n = new URLSearchParams(window.location.search).get("next");
    if (n && n.startsWith("/")) setNext(n);

    platformMe()
      .then((ok) => {
        if (ok) window.location.href = n && n.startsWith("/") ? n : "/";
      })
      .catch(() => {});
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!username || !password) {
      setError("Isi username dan password.");
      return;
    }
    setBusy(true);
    setError("");
    const res = await loginPlatform(username, password);
    if (res.ok) {
      window.location.href = next;
    } else {
      setError(res.error || "Gagal login.");
      setBusy(false);
    }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4 py-6 bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-sm">
        <div className="mb-6 sm:mb-8 text-center">
          <div className="inline-flex items-center justify-center size-12 rounded-xl bg-brand-600 text-white mb-4 shadow-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-6" aria-hidden="true">
              <path d="M12 3v3m0 0a4 4 0 0 1 4 4v4a4 4 0 0 1-4 4m0-12a4 4 0 0 0-4 4v4a4 4 0 0 0 4 4m0 0v3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Bearich Hub
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 px-2">
            Masuk ke Bearich Hub untuk membuka aplikasi Anda.
          </p>
        </div>

        <form onSubmit={submit} className="card p-5 sm:p-6 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="username" className="label">Username</label>
            <input
              id="username"
              className="input"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="label">Password</label>
            <input
              id="password"
              className="input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button className="btn-primary w-full" disabled={busy}>
            {busy ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}