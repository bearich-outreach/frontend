"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { StatCard } from "@/components/bits";
import { fmtDate, fmtRupiah } from "@/lib/format";
import { CashflowAccount, CashflowSettings, CashflowSummary, Transaction } from "@/lib/types";
import { CASHFLOW_API, apiGet } from "@/lib/api";

export default function CashflowDashboardPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [summary, setSummary] = useState<CashflowSummary | null>(null);
  const [settings, setSettings] = useState<CashflowSettings | null>(null);
  const [balanceAll, setBalanceAll] = useState(0);
  const [accounts, setAccounts] = useState<CashflowAccount[]>([]);
  const [recent, setRecent] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (sd: string, ed: string) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (sd) params.set("startDate", sd);
      if (ed) params.set("endDate", ed);
      const q = params.toString() ? `?${params.toString()}` : "";
      const [s, t, a, st] = await Promise.all([
        apiGet<{ summary: CashflowSummary }>(`${CASHFLOW_API}/summary${q}`),
        apiGet<{ transactions: Transaction[] }>(`${CASHFLOW_API}/transactions${q}`),
        apiGet<{ accounts: CashflowAccount[] }>(`${CASHFLOW_API}/accounts`),
        apiGet<{ settings: CashflowSettings; balance: number }>(`${CASHFLOW_API}/settings`),
      ]);
      setSummary(s.summary);
      setRecent(t.transactions.slice(0, 8));
      setAccounts(a.accounts);
      setSettings(st.settings);
      setBalanceAll(st.balance);
      setLoading(false);
    } catch (e) {
      if (e instanceof Error && e.message !== "Unauthorized") {
        setError("Tidak dapat terhubung ke server API. Pastikan backend berjalan, lalu muat ulang.");
      }
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(startDate, endDate);
  }, [startDate, endDate, load]);

  const catEntries = Object.entries(summary?.byCategory ?? {});
  const balanceByAccount = new Map(
    (summary?.perAccount ?? []).map((b) => [b.account, b.balance])
  );

  const target = settings?.targetAmount ?? 0;
  const targetActive = target > 0;
  const progress = targetActive ? Math.max(0, Math.min(1, balanceAll / target)) : 0;
  const reached = targetActive && balanceAll >= target;

  const dateLabel = (() => {
    if (startDate && endDate) return `${fmtDate(startDate)} – ${fmtDate(endDate)}`;
    if (startDate) return `dari ${fmtDate(startDate)}`;
    if (endDate) return `sampai ${fmtDate(endDate)}`;
    return "Semua waktu";
  })();

  const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const presetDate = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const presetBulanIni = () => {
    const d = new Date();
    const start = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
    const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    const end = `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, "0")}-${String(last.getDate()).padStart(2, "0")}`;
    return { start, end };
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 break-words">
            Rekap uang masuk & keluar per akun
            <span className="ml-1 font-medium text-zinc-700 dark:text-zinc-300">
              · {dateLabel}
            </span>
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full lg:w-auto">
          <div className="flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-800 p-1 overflow-x-auto scrollbar-none w-full lg:w-auto">
            <button
              onClick={() => {
                const v = presetDate(0);
                setStartDate(v);
                setEndDate(v);
              }}
              className={`shrink-0 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                startDate && endDate && startDate === endDate && startDate === presetDate(0)
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              Hari ini
            </button>
            <button
              onClick={() => {
                const v = presetDate(-1);
                setStartDate(v);
                setEndDate(v);
              }}
              className={`shrink-0 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                startDate && endDate && startDate === endDate && startDate === presetDate(-1)
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              Kemarin
            </button>
            <button
              onClick={() => {
                const { start, end } = presetBulanIni();
                setStartDate(start);
                setEndDate(end);
              }}
              className="shrink-0 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              Bulan ini
            </button>
            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
              className={`shrink-0 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                !startDate && !endDate
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              Semua waktu
            </button>
          </div>
          <div className="flex items-center gap-2 w-full">
            <input
              type="date"
              className="input flex-1 min-w-0 text-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="text-xs text-zinc-400 shrink-0">s/d</span>
            <input
              type="date"
              className="input flex-1 min-w-0 text-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="card p-8 text-center">
          <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
          <button className="btn-primary mt-4" onClick={() => load(startDate, endDate)}>
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
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <StatCard label="Uang Masuk" value={fmtRupiah(summary?.totalIn)} sub={`${summary?.countIn ?? 0} transaksi`} />
              <StatCard label="Uang Keluar" value={fmtRupiah(summary?.totalOut)} sub={`${summary?.countOut ?? 0} transaksi`} />
              <StatCard
                label="Saldo"
                value={fmtRupiah(summary?.balance)}
                sub={(summary?.balance ?? 0) >= 0 ? "surplus" : "defisit"}
              />
            </div>

            {targetActive && (
              <div className={`card p-5 ${reached ? "border-emerald-400 dark:border-emerald-500/50" : ""}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                      Target Tabungan
                    </h2>
                    {reached && (
                      <span className="inline-flex items-center rounded-full border border-emerald-300 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 text-xs font-medium dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                        Target tercapai 🎉
                      </span>
                    )}
                  </div>
                  <Link href="/apps/cashflow/settings" className="text-sm text-brand-600 hover:underline">
                    Atur target
                  </Link>
                </div>

                <div className="mb-1 flex items-baseline justify-between">
                  <span className="text-sm text-zinc-600 dark:text-zinc-300">
                    {fmtRupiah(balanceAll)} dari {fmtRupiah(target)}
                  </span>
                  <span className={`text-sm font-semibold ${reached ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-700 dark:text-zinc-200"}`}>
                    {Math.round(progress * 100)}%
                  </span>
                </div>

                <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <div
                    className={`h-full rounded-full transition-all ${
                      reached
                        ? "bg-emerald-500"
                        : balanceAll < 0
                        ? "bg-rose-500"
                        : "bg-brand-500"
                    }`}
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>

                <p className="mt-2 text-xs text-zinc-500">
                  {reached
                    ? "Selamat, target tabungan Anda tercapai."
                    : balanceAll < 0
                    ? "Saldo masih negatif. Target tercapai saat saldo melebihi target."
                    : `Tinggal ${fmtRupiah(target - balanceAll)} lagi untuk mencapai target.`}
                </p>
              </div>
            )}

            <div className="card p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">
                  Saldo per Akun
                  <span className="ml-2 text-xs font-normal text-zinc-500">· {dateLabel}</span>
                </h2>
                <Link href="/apps/cashflow/accounts" className="text-sm text-brand-600 hover:underline shrink-0">
                  Kelola akun
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
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
              {(startDate || endDate) && <p className="mt-3 text-xs text-zinc-400">Menampilkan saldo bersih per akun untuk {dateLabel}.</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="card p-4 sm:p-5">
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3 text-sm sm:text-base">
                  Rincian per Kategori
                  <span className="ml-2 text-xs font-normal text-zinc-500">· {dateLabel}</span>
                </h2>
                {catEntries.length === 0 ? (
                  <p className="text-sm text-zinc-500">Belum ada transaksi {startDate || endDate ? `pada ${dateLabel}` : ""}.</p>
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

              <div className="card p-4 sm:p-5">
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3 text-sm sm:text-base">
                  Transaksi Terbaru
                  <span className="ml-2 text-xs font-normal text-zinc-500">· {dateLabel}</span>
                </h2>
                {recent.length === 0 ? (
                  <p className="text-sm text-zinc-500">Belum ada transaksi {startDate || endDate ? `pada ${dateLabel}` : ""}.</p>
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