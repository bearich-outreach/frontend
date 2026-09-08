"use client";
import { OUTREACH_API, apiFetch } from "@/lib/api";

import { useEffect, useState } from "react";
import { Settings } from "@/lib/types";

export default function SettingsPage() {
  const [s, setS] = useState<Settings | null>(null);
  const [servicesText, setServicesText] = useState("");
  const [saved, setSaved] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch(`${OUTREACH_API}/settings`)
      .then((r) => r.json())
      .then((data: { settings: Settings }) => {
        setS(data.settings);
        setServicesText(data.settings.services.join("\n"));
      })
      .catch(() => {
        setError("Tidak dapat terhubung ke server API. Pastikan backend berjalan, lalu muat ulang.");
      });
  }, []);

  async function save() {
    if (!s) return;
    setBusy(true);
    const body: Record<string, unknown> = {
      businessName: s.businessName,
      services: servicesText
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean),
      provider: s.provider,
      apiKey: s.apiKey,
      baseUrl: s.baseUrl,
      model: s.model,
    };
    const res = await apiFetch(`${OUTREACH_API}/settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data = (await res.json()) as { settings: Settings };
      setS(data.settings);
      setSaved("Pengaturan disimpan.");
      setTimeout(() => setSaved(""), 2000);
    }
    setBusy(false);
  }

  if (error) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
        <button className="btn-primary mt-4" onClick={() => window.location.reload()}>
          Muat ulang
        </button>
      </div>
    );
  }

  if (!s) return <p className="text-zinc-500">Memuat...</p>;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50">Settings</h1>
          <p className="text-sm text-zinc-500">
            Profil bisnis, template pesan, dan konfigurasi AI.
          </p>
        </div>
        <button className="btn-primary shrink-0 text-sm" onClick={save} disabled={busy}>
          Simpan
        </button>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-700 rounded-lg px-4 py-2 text-sm">
          {saved}
        </div>
      )}

      <div className="card p-4 sm:p-5 space-y-3">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Profil Bisnis</h2>
        <div>
          <label className="label">Nama bisnis / brand</label>
          <input
            className="input"
            value={s.businessName}
            onChange={(e) => setS({ ...s, businessName: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Layanan (satu per baris)</label>
          <textarea
            className="input"
            rows={4}
            value={servicesText}
            onChange={(e) => setServicesText(e.target.value)}
          />
        </div>
      </div>

      <div className="card p-4 sm:p-5 space-y-3">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">AI Message Generator</h2>
        <p className="text-xs text-zinc-500">
          Tanpa API key, sistem memakai template fallback (berfungsi penuh).
          Aktifkan DeepSeek untuk pesan yang lebih personal otomatis.
          {s.apiKey === "" && s.provider === "deepseek" && (
            <span className="block mt-1 text-emerald-600">✓ DeepSeek key diatur via .env (DEEPSEEK_API_KEY) — aman, tidak disimpan di DB.</span>
          )}
        </p>
        <div>
          <label className="label">Provider</label>
          <select
            className="input"
            value={s.provider}
            onChange={(e) => setS({ ...s, provider: e.target.value })}
          >
            <option value="none">None (pakai template fallback)</option>
            <option value="deepseek">DeepSeek</option>
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">API Key DeepSeek</label>
            <input
              className="input"
              type="password"
              value={s.apiKey}
              onChange={(e) => setS({ ...s, apiKey: e.target.value })}
              placeholder="sk-..."
            />
          </div>
          <div>
            <label className="label">Base URL</label>
            <input
              className="input"
              value={s.baseUrl}
              onChange={(e) => setS({ ...s, baseUrl: e.target.value })}
              placeholder="https://api.deepseek.com/v1"
            />
          </div>
        </div>
        <div>
          <label className="label">Model</label>
          <input
            className="input"
            value={s.model}
            onChange={(e) => setS({ ...s, model: e.target.value })}
            placeholder="deepseek-chat"
          />
        </div>
        <p className="text-xs text-zinc-500">
          Limit harian diatur via env server (DAILY_DEEPSEEK_LIMIT, 0 = tanpa batas). Pemakaian hari ini tampil di Dashboard.
        </p>
      </div>
    </div>
  );
}