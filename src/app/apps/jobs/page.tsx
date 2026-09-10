"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { JOBS_API, apiGet } from "@/lib/api";

interface Stats {
  listings: { total: number; byStatus: Record<string, number>; hidden: number };
  targets: { total: number; byStatus: Record<string, number> };
  raw: number;
}

export default function JobsDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet<Stats>(`${JOBS_API}/stats`).then(setStats).catch(() => setError("Tidak dapat terhubung ke backend."));
  }, []);

  if (error) return <div className="card p-6 text-sm text-rose-600">{error}</div>;
  if (!stats) return <div className="card p-6 animate-pulse text-sm text-zinc-400">Memuat...</div>;

  const by = stats.listings.byStatus;
  const cards: { label: string; value: number; sub?: string }[] = [
    { label: "Total Lowongan", value: stats.listings.total, sub: "tanpa Sampah" },
    { label: "New", value: by["New"] ?? 0, sub: "terbaru di atas" },
    { label: "Saved", value: by["Saved"] ?? 0 },
    { label: "Applied", value: by["Applied"] ?? 0 },
    { label: "Interview", value: by["Interview"] ?? 0 },
    { label: "Sampah (hidden)", value: stats.listings.hidden, sub: "bukan remote / salah" },
    { label: "Targets", value: stats.targets.total, sub: `PENDING ${stats.targets.byStatus["PENDING"] ?? 0}` },
    { label: "Raw", value: stats.raw, sub: "mentah dedup" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div>
          <h1 className="text-xl font-bold">Job Hunter — Full Remote Web Only</h1>
          <p className="text-sm text-zinc-500">Glints + JobStreet · tanpa filter skill/gaji/kontrak · verifikasi manual via tombol Check · Gmail Batch 4 menyusul</p>
        </div>
        <div className="flex gap-2">
          <Link className="btn-primary text-sm" href="/apps/jobs/listings">Buka Lowongan</Link>
          <Link className="btn-secondary text-sm" href="/apps/jobs/targets">Targets</Link>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="card p-4">
            <div className="text-xs text-zinc-500">{c.label}</div>
            <div className="text-2xl font-bold">{c.value}</div>
            {c.sub && <div className="text-xs text-zinc-400">{c.sub}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
