"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { JOBS_API, apiGet } from "@/lib/api";
import { SkillsResponse } from "@/lib/types";

interface Stats {
  listings: { total: number; byStatus: Record<string, number>; hidden: number };
  targets: { total: number; byStatus: Record<string, number> };
  raw: number;
  scope?: {
    id: { total: number; byStatus: Record<string, number>; hidden: number };
    global: { total: number; byStatus: Record<string, number>; hidden: number };
  };
}

export default function JobsDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [skills, setSkills] = useState<SkillsResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet<Stats>(`${JOBS_API}/stats`).then(setStats).catch(() => setError("Tidak dapat terhubung ke backend."));
    apiGet<SkillsResponse>(`${JOBS_API}/skills?limit=10`).then(setSkills).catch(() => {});
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
          <p className="text-sm text-zinc-500">Glints + JobStreet + Indeed · tanpa filter skill/gaji/kontrak · verifikasi manual via tombol Check · Gmail Batch 4 menyusul</p>
        </div>
        <div className="flex gap-2">
          <Link className="btn-primary text-sm" href="/apps/jobs/listings">Buka Lowongan</Link>
          <Link className="btn-secondary text-sm" href="/apps/jobs/global">Global Remote</Link>
          <Link className="btn-secondary text-sm" href="/apps/jobs/skills">Top Skills</Link>
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
      {stats.scope && (
        <Link href="/apps/jobs/global" className="card p-4 flex justify-between items-center hover:shadow transition-shadow">
          <div>
            <div className="text-xs text-zinc-500">Global Remote <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-700">via API</span></div>
            <div className="text-2xl font-bold">{stats.scope.global.total}</div>
            <div className="text-xs text-zinc-400">
              New {stats.scope.global.byStatus["New"] ?? 0} · Saved {stats.scope.global.byStatus["Saved"] ?? 0} · Applied {stats.scope.global.byStatus["Applied"] ?? 0} · Sampah {stats.scope.global.hidden}
            </div>
          </div>
          <div className="text-sm text-zinc-400">Buka →</div>
        </Link>
      )}
      <div className="card p-4">
        <div className="flex justify-between items-center mb-3">
          <div>
            <div className="font-semibold text-sm">Top 10 Skill Requirement</div>
            <div className="text-xs text-zinc-400">
              {skills ? `Dari ${skills.total} lowongan aktif · angka = jumlah lowongan` : "Memuat..."}
            </div>
          </div>
          <Link className="btn-secondary text-sm" href="/apps/jobs/skills">Lihat semua</Link>
        </div>
        {skills && skills.skills.length > 0 ? (
          <div className="space-y-2">
            {skills.skills.map((s, i) => (
              <div key={s.skill} className="flex items-center gap-3">
                <div className="w-5 text-xs text-zinc-400 text-right shrink-0">{i + 1}</div>
                <div className="w-28 shrink-0 text-sm font-medium truncate">{s.skill}</div>
                <div className="flex-1 h-4 rounded bg-zinc-100 overflow-hidden">
                  <div
                    className="h-full rounded bg-emerald-500"
                    style={{ width: `${Math.max(2, Math.round((s.count / (skills.skills[0]?.count ?? 1)) * 100))}%` }}
                  />
                </div>
                <div className="w-20 text-right text-sm shrink-0">
                  <span className="font-bold">{s.count}</span>
                  <span className="text-zinc-400"> · {s.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-zinc-400">
            {skills ? "Belum ada skill terdeteksi — jalankan Scrape Next di Targets." : "Memuat..."}
          </div>
        )}
      </div>
    </div>
  );
}
