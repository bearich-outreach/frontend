"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { StatCard } from "@/components/bits";
import { fmtDate, fmtRupiah } from "@/lib/format";
import { CashflowAccount, CashflowSummary, Transaction } from "@/lib/types";
import { CASHFLOW_API, apiGet } from "@/lib/api";

export default function CashflowDashboardPage() {
  const [month, setMonth] = useState("");
  const [summary, setSummary] = useState<CashflowSummary | null>(null);
  const [accounts, setAccounts] = useState<CashflowAccount[]>([]);
  const [recent, setRecent] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (m: string) => {
    setLoading(true);
    setError("");
    try {
      const q = m ? `?month=${m}` : "";
      const [s, t, a] = await Promise.all([
        apiGet<{ summary: CashflowSummary }>(`${CASHFLOW_API}/summary${q}`),
        apiGet<{ transactions: Transaction[] }>(`${CASHFLOW_API}/transactions${q}`),
        apiGet<{ accounts: CashflowAccount[] }>(`${CASHFLOW_API}/accounts`),
      ]);
      setSummary(s.summary);
      setRecent(t.transactions.slice(0, 8));
      setAccounts(a.accounts);
      setLoading(false);
    } catch (e) {
      if (e instanceof Error && e.message !== "Unauthorized") {
        setError("Tidak dapat terhubung ke server API. Pastikan backend berjalan, lalu muat ulang.");
      }
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(month);
  }, [month, load]);

  const catEntries = Object.entries(summary?.byCategory ?? {});
  const balanceByAccount = new Map(
    (summary?.perAccount ?? []).map((b) => [b.account, b.balance])
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Dashboard
          </h1>
          <p className="text-sm text-zinc-500">
            Rekap uang masuk & keluar per akun. Kosongkan bulan untuk seluruh waktu.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="month"
            className="input !w-auto"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
          {month && (
            <button className="btn-secondary" onClick={() => setMonth("")}>
              Semua waktu
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="card p-8 text-center">
          <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
          <button className="btn-primary mt-4" onClick={() => load(month)}>
            Muat ulang
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            ))}
          </div>
          <div className="h-64 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        </div>
      ) : (
        !error && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard label="Uang Masuk" value={fmtRupiah(summary?.totalIn)} sub={`${summary?.countIn ?? 0} transaksi`} />
              <StatCard label="Uang Keluar" value={fmtRupiah(summary?.totalOut)} sub={`${summary?.countOut ?? 0} transaksi`} />
              <StatCard
                label="Saldo"
                value={fmtRupiah(summary?.balance)}
                sub={(summary?.balance ?? 0) >= 0 ? "surplus" : "defisit"}
              />
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Saldo per Akun
                </h2>
                <Link href="/apps/cashflow/accounts" className="text-sm text-brand-600 hover:underline">
                  Kelola akun
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {accounts.map((a) => {
                  const bal = balanceByAccount.get(a.name) ?? 0;
                  return (
                    <div key={a.id} className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
                      <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{a.name}</div>
                      <div className={`mt-1 font-mono text-lg font-semibold tracking-tight ${bal >= 0 ? "text-zinc-900 dark:text-zinc-50" : "text-rose-600 dark:text-rose-400"}`}>
                        {fmtRupiah(bal)}
                      </div>
                    </div>
                  );
                })}
                {accounts.length === 0 && (
                  <p className="text-sm text-zinc-500">Belum ada akun.</p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="card p-5">
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                  Rincian per Kategori
                </h2>
                {catEntries.length === 0 ? (
                  <p className="text-sm text-zinc-500">Belum ada transaksi.</p>
                ) : (
                  <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {catEntries.map(([cat, amt]) => (
                      <li key={cat} className="py-2 flex items-center justify-between">
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">{cat}</span>
                        <span className={`text-sm font-medium ${amt >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                          {fmtRupiah(amt)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="card p-5">
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                  Transaksi Terbaru
                </h2>
                {recent.length === 0 ? (
                  <p className="text-sm text-zinc-500">Belum ada transaksi.</p>
                ) : (
                  <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {recent.map((t) => (
                      <li key={t.id} className="py-2 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                            {t.description || t.category}
                          </div>
                          <div className="text-xs text-zinc-400">
                            {fmtDate(t.date)} · {t.category} · {t.account}
                          </div>
                        </div>
                        <span className={`text-sm font-medium shrink-0 ${t.type === "in" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                          {t.type === "in" ? "+" : "−"} {fmtRupiah(t.amount)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <Link href="/apps/cashflow/transactions" className="btn-primary mt-3 inline-flex">
                  Buka semua transaksi
                </Link>
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
}