"use client";

import { useCallback, useEffect, useState } from "react";
import { fmtRupiah } from "@/lib/format";
import {
  ACCOUNT_TYPES,
  AccountType,
  CashflowAccount,
  CashflowSummary,
} from "@/lib/types";
import { CASHFLOW_API, apiFetch } from "@/lib/api";

const TYPE_OPTIONS: AccountType[] = ["tunai", "ewallet", "rekening", "lainnya"];

export default function CashflowAccountsPage() {
  const [accounts, setAccounts] = useState<CashflowAccount[]>([]);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("lainnya");
  const [editing, setEditing] = useState<CashflowAccount | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState<AccountType>("lainnya");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const [a, s] = await Promise.all([
        apiFetch(`${CASHFLOW_API}/accounts`).then((r) => r.json()),
        apiFetch(`${CASHFLOW_API}/summary`).then((r) => r.json()),
      ]);
      setAccounts((a as { accounts: CashflowAccount[] }).accounts);
      const map: Record<string, number> = {};
      ((s as { summary: CashflowSummary }).summary.perAccount ?? []).forEach(
        (b) => (map[b.account] = b.balance)
      );
      setBalances(map);
    } catch {
      setError("Tidak dapat terhubung ke server API. Muat ulang untuk mencoba lagi.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setNotice("");
    const res = await apiFetch(`${CASHFLOW_API}/accounts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type }),
    });
    setBusy(false);
    if (res.ok) {
      setName("");
      setType("lainnya");
      load();
    } else {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      setError(d.error || "Gagal menambah akun.");
    }
  }

  function startEdit(a: CashflowAccount) {
    setEditing(a);
    setEditName(a.name);
    setEditType(a.type);
    setError("");
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setBusy(true);
    const res = await apiFetch(`${CASHFLOW_API}/accounts/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, type: editType }),
    });
    setBusy(false);
    if (res.ok) {
      setEditing(null);
      load();
    } else {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      setError(d.error || "Gagal menyimpan akun.");
    }
  }

  async function remove(a: CashflowAccount) {
    if (!confirm(`Hapus akun "${a.name}"?`)) return;
    setNotice("");
    const res = await apiFetch(`${CASHFLOW_API}/accounts/${a.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      load();
    } else {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      setError(d.error || "Gagal menghapus akun.");
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50">Akun</h1>
        <p className="text-sm text-zinc-500">
          Kelola tempat penyimpanan uang: Tunai, E-Wallet, Rekening, dan lainnya.
        </p>
      </div>

      {error && (
        <div className="text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}
      {notice && (
        <div className="text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg px-3 py-2">
          {notice}
        </div>
      )}

      <div className="card p-4 sm:p-5">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4 text-sm sm:text-base">Tambah Akun</h2>
        <form onSubmit={add} className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
          <div>
            <label className="label">Nama akun</label>
            <input
              className="input"
              placeholder="cth: Rekening BCA, Dana"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Tipe</label>
            <select className="input" value={type} onChange={(e) => setType(e.target.value as AccountType)}>
              {TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>{ACCOUNT_TYPES[t]}</option>
              ))}
            </select>
          </div>
          <button className="btn-primary col-span-1 sm:col-span-2 lg:col-span-1 w-full sm:w-auto" disabled={busy}>
            {busy ? "Menyimpan..." : "Tambah Akun"}
          </button>
        </form>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
              <th className="px-4 py-3">Akun</th>
              <th className="px-4 py-3">Tipe</th>
              <th className="px-4 py-3 text-right">Saldo</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((a) => {
              const bal = balances[a.name] ?? 0;
              return (
                <tr key={a.id} className="border-b border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/40">
                  <td className="px-4 py-3 font-medium text-zinc-800 dark:text-zinc-100">{a.name}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{ACCOUNT_TYPES[a.type]}</td>
                  <td className={`px-4 py-3 text-right font-medium ${bal >= 0 ? "text-zinc-900 dark:text-zinc-50" : "text-rose-600 dark:text-rose-400"}`}>
                    {fmtRupiah(bal)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button className="btn-secondary !py-1" onClick={() => startEdit(a)}>Edit</button>
                      <button className="btn-danger !py-1" onClick={() => remove(a)}>Hapus</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {accounts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-zinc-400">Belum ada akun.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {accounts.map((a) => {
          const bal = balances[a.name] ?? 0;
          return (
            <div key={a.id} className="card p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-medium text-zinc-900 dark:text-zinc-100 truncate">{a.name}</div>
                  <div className="text-xs text-zinc-500">{ACCOUNT_TYPES[a.type]}</div>
                </div>
                <div className={`text-sm font-semibold font-mono shrink-0 ${bal >= 0 ? "text-zinc-900 dark:text-zinc-50" : "text-rose-600 dark:text-rose-400"}`}>{fmtRupiah(bal)}</div>
              </div>
              <div className="flex gap-2 pt-1">
                <button className="btn-secondary !py-1.5 flex-1 text-xs" onClick={() => startEdit(a)}>Edit</button>
                <button className="btn-danger !py-1.5 flex-1 text-xs" onClick={() => remove(a)}>Hapus</button>
              </div>
            </div>
          );
        })}
        {accounts.length === 0 && (
          <div className="card p-8 text-center text-zinc-400 text-sm">Belum ada akun.</div>
        )}
      </div>

      {editing && (
        <div className="card p-6 max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Edit Akun</h2>
            <button className="btn-secondary !py-1" onClick={() => setEditing(null)}>Batal</button>
          </div>
          <form onSubmit={saveEdit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
            <div>
              <label className="label">Nama akun</label>
              <input className="input" value={editName} onChange={(e) => setEditName(e.target.value)} required />
            </div>
            <div>
              <label className="label">Tipe</label>
              <select className="input" value={editType} onChange={(e) => setEditType(e.target.value as AccountType)}>
                {TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>{ACCOUNT_TYPES[t]}</option>
                ))}
              </select>
            </div>
            <button className="btn-primary" disabled={busy}>Simpan Perubahan</button>
          </form>
        </div>
      )}
    </div>
  );
}