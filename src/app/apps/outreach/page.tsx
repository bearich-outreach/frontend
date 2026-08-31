"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StatCard } from "@/components/bits";
import { fmtDate } from "@/lib/format";
import { STATUS_LABELS, STATUS_ORDER, Prospect } from "@/lib/types";
import { OUTREACH_API, apiGet } from "@/lib/api";

interface Metrics {
  total: number;
  due: number;
  replyRate: number;
  closeRate: number;
  closed: number;
  revenue: number;
  byStatus: Record<string, number>;
}

export default function OutreachDashboardPage() {
  const [m, setM] = useState<Metrics | null>(null);
  const [due, setDue] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiGet<{ metrics: Metrics }>(`${OUTREACH_API}/stats`),
      apiGet<{ due: Prospect[] }>(`${OUTREACH_API}/queue`),
    ])
      .then(([s, o]) => {
        setM(s.metrics);
        setDue(o.due);
        setLoading(false);
      })
      .catch((e) => {
        if (e instanceof Error && e.message !== "Unauthorized") {
          setError("Tidak dapat terhubung ke server API. Pastikan backend berjalan, lalu muat ulang.");
        }
        setLoading(false);
      });
  }, []);

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Dashboard
        </h1>
        <p className="text-sm text-zinc-500">
          Pipeline & metrik konsistensi outreach Anda.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Prospek" value={m?.total ?? 0} />
        <StatCard label="Butuh Outreach" value={m?.due ?? 0} sub="tindakan hari ini" />
        <StatCard label="Reply Rate" value={`${m?.replyRate ?? 0}%`} sub="replied / total" />
        <StatCard
          label="Revenue"
          value={`Rp ${(m?.revenue ?? 0).toLocaleString("id-ID")}`}
          sub={`${m?.closed ?? 0} deal`}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {STATUS_ORDER.map((s) => (
          <StatCard key={s} label={STATUS_LABELS[s]} value={m?.byStatus[s] ?? 0} />
        ))}
      </div>

      <div className="card p-4">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
          Antrian Tindakan Hari Ini
        </h2>
        {due.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Tidak ada yang perlu di-outreach. Tambah prospek baru atau isi pipeline.
          </p>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {due.slice(0, 8).map((p) => (
              <li key={p.id} className="py-2 flex items-center justify-between">
                <div>
                  <span className="font-medium text-zinc-800 dark:text-zinc-100">
                    {p.name}
                  </span>
                  {p.company && (
                    <span className="text-zinc-500"> · {p.company}</span>
                  )}
                </div>
                <div className="text-xs text-zinc-400">
                  follow-up {p.followUpStep + 1} · jatuh tempo{" "}
                  {fmtDate(p.nextFollowUpAt)}
                </div>
              </li>
            ))}
          </ul>
        )}
        <Link href="/apps/outreach/queue" className="btn-primary mt-3 inline-flex">
          Buka Outreach Queue
        </Link>
      </div>
    </div>
  );
}