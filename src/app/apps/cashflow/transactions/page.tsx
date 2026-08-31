"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CashflowTransactionForm } from "@/components/cashflow-transaction-form";
import { fmtDate, fmtRupiah } from "@/lib/format";
import { CashflowAccount, CASHFLOW_CATEGORIES, Transaction } from "@/lib/types";
import { CASHFLOW_API, apiFetch } from "@/lib/api";

export default function CashflowTransactionsPage() {
  const [rows, setRows] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<CashflowAccount[]>([]);
  const [month, setMonth] = useState(() => {
    if (typeof window === "undefined") return "";
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [account, setAccount] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (month) params.set("month", month);
      if (type) params.set("type", type);
      if (category) params.set("category", category);
      if (account) params.set("account", account);
      const q = params.toString();
      const [res, accRes] = await Promise.all([
        apiFetch(`${CASHFLOW_API}/transactions${q ? `?${q}` : ""}`),
        apiFetch(`${CASHFLOW_API}/accounts`),
      ]);
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = (await res.json()) as { transactions: Transaction[] };
      const accData = (await accRes.json()) as { accounts: CashflowAccount[] };
      setRows(data.transactions);
      setAccounts(accData.accounts);
      setLoading(false);
    } catch (e) {
      if (e instanceof Error && e.message !== "Unauthorized") {
        setError("Tidak dapat terhubung ke server API. Pastikan backend berjalan, lalu muat ulang.");
      }
      setLoading(false);
    }
  }, [month, type, category, account]);

  useEffect(() => {
    load();
  }, [load]);

  async function submitEdit(
    t: Transaction,
    data: {
      type: "in" | "out";
      amount: number;
      category: string;
      description: string;
      date: string;
    }
  ) {
    setBusy(true);
    const res = await apiFetch(`${CASHFLOW_API}/transactions/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setBusy(false);
    if (res.ok) {
      setEditingId(null);
      load();
    } else {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      alert(d.error || "Gagal menyimpan perubahan.");
    }
  }

  async function remove(t: Transaction) {
    if (!confirm(`Hapus transaksi ${fmtRupiah(t.amount)}?`)) return;
    await apiFetch(`${CASHFLOW_API}/transactions/${t.id}`, { method: "DELETE" });
    load();
  }

  const total = rows.reduce((sum, t) => sum + (t.type === "in" ? t.amount : -t.amount), 0);
  const editing = editingId ? rows.find((r) => r.id === editingId) ?? null : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Transaksi
          </h1>
          <p className="text-sm text-zinc-500">{rows.length} transaksi.</p>
        </div>
        <Link href="/apps/cashflow/transactions/new" className="btn-primary">
          + Catat Transaksi
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="month"
          className="input !w-auto"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
        <select className="input !w-auto" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Semua tipe</option>
          <option value="in">Uang Masuk</option>
          <option value="out">Uang Keluar</option>
        </select>
        <select className="input !w-auto" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Semua kategori</option>
          {CASHFLOW_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select className="input !w-auto" value={account} onChange={(e) => setAccount(e.target.value)}>
          <option value="">Semua akun</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.name}>{a.name}</option>
          ))}
        </select>
        {(month || type || category || account) && (
          <button
            className="btn-secondary"
            onClick={() => {
              setMonth("");
              setType("");
              setCategory("");
              setAccount("");
            }}
          >
            Reset
          </button>
        )}
        <span className="ml-auto text-sm font-medium text-zinc-600 dark:text-zinc-300">
          Total: <span className={total >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>{fmtRupiah(total)}</span>
        </span>
      </div>

      {error && (
        <div className="card p-8 text-center">
          <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
          <button className="btn-primary mt-4" onClick={load}>Muat ulang</button>
        </div>
      )}

      {loading ? (
        <div className="h-64 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
      ) : (
        !error && (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Tipe</th>
                  <th className="px-4 py-3">Akun</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Keterangan</th>
                  <th className="px-4 py-3 text-right">Nominal</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.id} className="border-b border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/40">
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{fmtDate(t.date)}</td>
                    <td className="px-4 py-3">
                      {t.type === "in" ? (
                        <span className="inline-flex items-center rounded-full border border-emerald-300 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 text-xs font-medium dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                          Masuk
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-rose-300 bg-rose-50 text-rose-700 px-2.5 py-0.5 text-xs font-medium dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
                          Keluar
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{t.account}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{t.category}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{t.description || "—"}</td>
                    <td className={`px-4 py-3 text-right font-medium ${t.type === "in" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                      {t.type === "in" ? "+" : "−"} {fmtRupiah(t.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button className="btn-secondary !py-1" onClick={() => setEditingId(editingId === t.id ? null : t.id)}>
                          Edit
                        </button>
                        <button className="btn-danger !py-1" onClick={() => remove(t)}>
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-zinc-400">
                      Belum ada transaksi.{" "}
                      <Link href="/apps/cashflow/transactions/new" className="text-brand-600 underline">
                        Catat transaksi
                      </Link>
                      .
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )
      )}

      {editing && (
        <div className="card p-6 max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Edit Transaksi</h2>
            <button className="btn-secondary !py-1" onClick={() => setEditingId(null)}>Batal</button>
          </div>
          <CashflowTransactionForm
            initial={editing}
            onSubmit={(data) => submitEdit(editing, data)}
            submitLabel="Simpan Perubahan"
            busy={busy}
          />
        </div>
      )}
    </div>
  );
}