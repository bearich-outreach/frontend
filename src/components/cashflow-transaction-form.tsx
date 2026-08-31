"use client";

import { useEffect, useState } from "react";
import { CASHFLOW_API, apiGet } from "@/lib/api";
import {
  CASHFLOW_CATEGORIES,
  CashflowAccount,
  Transaction,
  TransactionType,
} from "@/lib/types";

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function CashflowTransactionForm({
  initial,
  onSubmit,
  submitLabel = "Simpan",
  busy = false,
}: {
  initial?: Transaction;
  onSubmit: (data: {
    type: TransactionType;
    amount: number;
    category: string;
    account: string;
    description: string;
    date: string;
  }) => Promise<void>;
  submitLabel?: string;
  busy?: boolean;
}) {
  const [accounts, setAccounts] = useState<CashflowAccount[]>([]);
  const [type, setType] = useState<TransactionType>(initial?.type ?? "out");
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [category, setCategory] = useState(initial?.category ?? "Makanan");
  const [account, setAccount] = useState(initial?.account ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [date, setDate] = useState(initial?.date ?? today());
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet<{ accounts: CashflowAccount[] }>(`${CASHFLOW_API}/accounts`)
      .then((d) => {
        setAccounts(d.accounts);
        if (!account && d.accounts.length) setAccount(d.accounts[0].name);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!amount.trim() || !Number.isFinite(value) || value <= 0) {
      setError("Nominal harus berupa angka positif.");
      return;
    }
    if (!date) {
      setError("Tanggal wajib diisi.");
      return;
    }
    if (!account) {
      setError("Pilih akun.");
      return;
    }
    setError("");
    await onSubmit({
      type,
      amount: value,
      category,
      account,
      description: description.trim(),
      date,
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label">Tipe</label>
        <div className="grid grid-cols-2 gap-2 mt-1">
          <button
            type="button"
            onClick={() => setType("in")}
            className={`btn ${type === "in" ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700" : "bg-white border border-zinc-300 text-zinc-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300"}`}
          >
            Uang Masuk
          </button>
          <button
            type="button"
            onClick={() => setType("out")}
            className={`btn ${type === "out" ? "bg-rose-600 text-white border-rose-600 hover:bg-rose-700" : "bg-white border border-zinc-300 text-zinc-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300"}`}
          >
            Uang Keluar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
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

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Akun</label>
          <select
            className="input"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            required
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Kategori</label>
          <select
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CASHFLOW_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Keterangan</label>
        <input
          className="input"
          placeholder="cth: pembayaran proyek X, belanja bulanan"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {error && (
        <p className="text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button className="btn-primary" disabled={busy}>
        {busy ? "Menyimpan..." : submitLabel}
      </button>
    </form>
  );
}