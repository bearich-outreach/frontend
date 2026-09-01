"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CashflowAccount } from "@/lib/types";
import { CASHFLOW_API, apiFetch } from "@/lib/api";

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export default function CashflowTransferPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<CashflowAccount[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch(`${CASHFLOW_API}/accounts`)
      .then((r) => r.json())
      .then((d: { accounts: CashflowAccount[] }) => {
        setAccounts(d.accounts);
        if (d.accounts.length >= 2) {
          setFrom(d.accounts[0].name);
          setTo(d.accounts[1].name);
        }
      })
      .catch(() => {});
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!from || !to) {
      setError("Pilih akun asal dan tujuan.");
      return;
    }
    if (from === to) {
      setError("Akun asal dan tujuan tidak boleh sama.");
      return;
    }
    const value = Number(amount);
    if (!amount.trim() || !Number.isFinite(value) || value <= 0) {
      setError("Nominal harus berupa angka positif.");
      return;
    }
    setError("");
    setBusy(true);
    const res = await apiFetch(`${CASHFLOW_API}/transfer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, amount: value, date }),
    });
    setBusy(false);
    if (res.ok) {
      router.push("/apps/cashflow/transactions");
    } else {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      setError(d.error || "Gagal transfer.");
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50">Transfer</h1>
        <p className="text-sm text-zinc-500">
          Pindahkan uang antar akun (mis. Tunai ke Rekening). Tidak memengaruhi saldo total.
        </p>
      </div>

      <div className="card p-4 sm:p-6">
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Dari akun</label>
              <select className="input" value={from} onChange={(e) => setFrom(e.target.value)} required>
                <option value="">Pilih akun</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.name}>{a.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Ke akun</label>
              <select className="input" value={to} onChange={(e) => setTo(e.target.value)} required>
                <option value="">Pilih akun</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.name}>{a.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Nominal (Rp)</label>
              <input
                className="input"
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Tanggal</label>
              <input
                className="input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button className="btn-primary" disabled={busy}>
            {busy ? "Memproses..." : "Transfer"}
          </button>
        </form>
      </div>
    </div>
  );
}