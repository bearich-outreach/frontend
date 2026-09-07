"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StatCard } from "@/components/bits";
import { OUTREACH_API, apiGet } from "@/lib/api";

interface Metrics {
  qualified: { total: number; byStatus: Record<string, number> };
  targets: { total: number; byStatus: Record<string, number> };
  rawLeads: number;
  dailySent: number;
  deepseekMode: "deepseek" | "spintax";
}

export default function OutreachDashboardPage() {
  const [m, setM] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet<{ metrics: Metrics }>(`${OUTREACH_API}/stats`)
      .then((s) => {
        setM(s.metrics);
        setLoading(false);
      })
      .catch((e) => {
        if (e instanceof Error && e.message !== "Unauthorized") {
          setError("Tidak dapat terhubung ke server API.");
        }
        setLoading(false);
      });
  }, []);

  if (error) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm text-rose-600">{error}</p>
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

  const q = m?.qualified;
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50">Dashboard Autopilot</h1>
        <p className="text-sm text-zinc-500">514 kota × 20 kategori = 10.280 target · 10/hari · 09-16 WIB · {m?.deepseekMode === "deepseek" ? "● DeepSeek aktif" : "○ Spintax"} (toggle di Settings, auto fallback jika kredit habis)</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Qualified Leads" value={q?.total ?? 0} sub="New Lead+Contacted+Replied" />
        <StatCard label="New Lead" value={q?.byStatus["New Lead"] ?? 0} sub="buffer" />
        <StatCard label="Terkirim Hari Ini" value={m?.dailySent ?? 0} sub="/10 limit" />
        <StatCard label="Raw Leads" value={m?.rawLeads ?? 0} sub="place_id dedup" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Targets Total" value={m?.targets.total ?? 0} />
        <StatCard label="PENDING" value={m?.targets.byStatus["PENDING"] ?? 0} />
        <StatCard label="DONE" value={m?.targets.byStatus["DONE"] ?? 0} />
        <StatCard label="FAILED" value={m?.targets.byStatus["FAILED"] ?? 0} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Contacted" value={q?.byStatus["Contacted"] ?? 0} />
        <StatCard label="Replied" value={q?.byStatus["Replied"] ?? 0} />
        <StatCard label="Reply Rate" value={q?.total ? `${Math.round(((q.byStatus["Replied"] ?? 0)/q.total)*100)}%` : "0%"} />
      </div>

      <div className="flex gap-2">
        <Link href="/apps/outreach/queue" className="btn-primary">Buka Queue Monitor</Link>
        <Link href="/apps/outreach/targets" className="btn-secondary">Lihat Targets</Link>
      </div>
    </div>
  );
}
