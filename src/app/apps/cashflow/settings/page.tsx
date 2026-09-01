"use client";

import { useCallback, useEffect, useState } from "react";
import { fmtRupiah } from "@/lib/format";
import { CashflowSettings } from "@/lib/types";
import { CASHFLOW_API, apiFetch } from "@/lib/api";

export default function CashflowSettingsPage() {
  const [settings, setSettings] = useState<CashflowSettings | null>(null);
  const [balance, setBalance] = useState(0);
  const [targetText, setTargetText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await apiFetch(`${CASHFLOW_API}/settings`);
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = (await res.json()) as {
        settings: CashflowSettings;
        balance: number;
      };
      setSettings(data.settings);
      setBalance(data.balance);
      setTargetText(
        data.settings.targetAmount > 0 ? String(data.settings.targetAmount) : ""
      );
    } catch {
      setError("Tidak dapat terhubung ke server API. Muat ulang untuk mencoba lagi.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(targetText);
    if (!targetText.trim() || !Number.isFinite(value) || value < 0) {
      setError("Target harus berupa angka >= 0.");
      return;
    }
    setError("");
    setSaved("");
    setBusy(true);
    const res = await apiFetch(`${CASHFLOW_API}/settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetAmount: value }),
    });
    setBusy(false);
    if (res.ok) {
      const data = (await res.json()) as { settings: CashflowSettings };
      setSettings(data.settings);
      setSaved("Target disimpan.");
      setTimeout(() => setSaved(""), 2000);
    } else {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      setError(d.error || "Gagal menyimpan target.");
    }
  }

  const reached =
    settings && settings.targetAmount > 0 && balance >= settings.targetAmount;

  async function remove() {
    if (!settings || settings.targetAmount <= 0) return;
    if (
      !confirm("Hapus target tabungan? Progress bar di dashboard akan disembunyikan.")
    )
      return;
    setError("");
    setSaved("");
    setBusy(true);
    const res = await apiFetch(`${CASHFLOW_API}/settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetAmount: 0 }),
    });
    setBusy(false);
    if (res.ok) {
      setSettings({ targetAmount: 0, targetType: "saving" });
      setTargetText("");
      setSaved("Target dihapus.");
      setTimeout(() => setSaved(""), 2000);
    } else {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      setError(d.error || "Gagal menghapus target.");
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50">Target</h1>
        <p className="text-sm text-zinc-500">
          Atur target tabungan dari total saldo Anda (seluruh waktu).
        </p>
      </div>

      {error && (
        <div className="text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}
      {saved && (
        <div className="text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg px-3 py-2">
          {saved}
        </div>
      )}

      <div className="card p-4 sm:p-6">
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Saldo saat ini
            </div>
            <div className="mt-1 font-mono text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {fmtRupiah(balance)}
            </div>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Target tabungan
            </div>
            <div className="mt-1 font-mono text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {settings?.targetAmount ? fmtRupiah(settings.targetAmount) : "—"}
            </div>
          </div>
        </div>

        {reached && (
          <div className="mb-4 text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg px-3 py-2">
            Target tercapai 🎉
          </div>
        )}

        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="label">Target tabungan (Rp)</label>
            <input
              className="input"
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              placeholder="cth: 50000000"
              value={targetText}
              onChange={(e) => setTargetText(e.target.value)}
            />
            <p className="mt-1 text-xs text-zinc-500">
              Progress bar di dashboard muncul hanya saat target diisi.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="btn-primary" disabled={busy}>
              {busy ? "Menyimpan..." : "Simpan Target"}
            </button>
            {settings && settings.targetAmount > 0 && (
              <button
                type="button"
                className="btn-danger"
                onClick={remove}
                disabled={busy}
              >
                Hapus Target
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}