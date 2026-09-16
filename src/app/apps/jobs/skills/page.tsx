"use client";
import { useEffect, useState } from "react";
import { JOBS_API, apiGet } from "@/lib/api";
import { SkillsResponse } from "@/lib/types";

const GROUPS = ["Semua grup", "Frontend", "Backend", "CMS & Commerce", "Infra & Data", "QA", "Lainnya"];

export default function JobsSkillsPage() {
  const [data, setData] = useState<SkillsResponse | null>(null);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"history" | "active">("history");
  const [source, setSource] = useState("");
  const [scope, setScope] = useState("all");
  const [status, setStatus] = useState("");
  const [days, setDays] = useState("");
  const [group, setGroup] = useState(GROUPS[0]);
  const [loading, setLoading] = useState(true);

  async function load(src: string, sc: string, st: string, d: string, m: string) {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ limit: "30", mode: m });
      if (src) params.set("source", src);
      else if (sc && sc !== "all") params.set("scope", sc);
      // Filter status hanya berlaku untuk mode Aktif; riwayat mengabaikannya.
      if (m === "active" && st) params.set("status", st);
      if (d) params.set("days", d);
      setData(await apiGet<SkillsResponse>(`${JOBS_API}/skills?${params}`));
    } catch {
      setError("Tidak dapat terhubung ke backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(source, scope, status, days, mode); }, [source, scope, status, days, mode]);

  const skills = (data?.skills ?? []).filter((s) => group === GROUPS[0] || s.group === group);
  const max = skills[0]?.count ?? 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div>
          <h1 className="text-xl font-bold">Top Skill Requirement</h1>
          <p className="text-sm text-zinc-500">
            {data
              ? mode === "history"
                ? `Dari ${data.total} lowongan pernah terlihat (tetap tercatat walau dihapus) · 1 lowongan = 1 vote per skill`
                : `Dari ${data.total} lowongan aktif (tanpa Sampah) · 1 lowongan = 1 vote per skill`
              : "Memuat..."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {(["history", "active"] as const).map((m) => (
            <button
              key={m}
              className={mode === m ? "btn-primary text-sm" : "btn-secondary text-sm"}
              onClick={() => setMode(m)}
              title={m === "history" ? "Riwayat permanen — tahan hapus lowongan" : "Hanya lowongan aktif (tanpa Sampah)"}
            >
              {m === "history" ? "Riwayat" : "Aktif"}
            </button>
          ))}
          {(["all", "id", "global"] as const).map((sc) => (
            <button
              key={sc}
              className={scope === sc && !source ? "btn-primary text-sm" : "btn-secondary text-sm"}
              onClick={() => { setScope(sc); setSource(""); }}
            >
              {sc === "all" ? "Semua" : sc === "id" ? "ID" : "Global"}
            </button>
          ))}
          <select className="input w-auto !py-1.5 text-sm" value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="">Semua sumber</option>
            <option value="glints">Glints</option>
            <option value="jobstreet">JobStreet</option>
            <option value="indeed">Indeed</option>
            <option value="openwebninja">OpenWebNinja</option>
          </select>
          <select className="input w-auto !py-1.5 text-sm" value={status} onChange={(e) => setStatus(e.target.value)} disabled={mode === "history"} title={mode === "history" ? "Filter status hanya berlaku di mode Aktif" : undefined}>
            <option value="">Semua status</option>
            <option value="New">New</option>
            <option value="Saved">Saved</option>
            <option value="Applied">Applied</option>
            <option value="Interview">Interview</option>
          </select>
          <select className="input w-auto !py-1.5 text-sm" value={days} onChange={(e) => setDays(e.target.value)}>
            <option value="">Semua waktu</option>
            <option value="7">7 hari terakhir</option>
            <option value="30">30 hari terakhir</option>
            <option value="90">90 hari terakhir</option>
          </select>
          <select className="input w-auto !py-1.5 text-sm" value={group} onChange={(e) => setGroup(e.target.value)}>
            {GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      {error && <div className="card p-6 text-sm text-rose-600">{error}</div>}
      {loading && <div className="card p-6 animate-pulse text-sm text-zinc-400">Memuat...</div>}

      {!loading && !error && (
        <div className="card p-4 space-y-3">
          {skills.map((s, i) => (
            <div key={s.skill} className="flex items-center gap-3">
              <div className="w-6 text-sm text-zinc-400 text-right shrink-0">{i + 1}</div>
              <div className="w-32 sm:w-40 shrink-0">
                <div className="text-sm font-semibold truncate">{s.skill}</div>
                <div className="text-xs text-zinc-400">{s.group}</div>
              </div>
              <div className="flex-1 h-5 rounded bg-zinc-100 overflow-hidden">
                <div
                  className="h-full rounded bg-emerald-500 transition-all"
                  style={{ width: `${Math.max(2, Math.round((s.count / max) * 100))}%` }}
                />
              </div>
              <div className="w-24 text-right text-sm shrink-0">
                <span className="font-bold">{s.count}</span>
                <span className="text-zinc-400"> · {s.pct}%</span>
              </div>
            </div>
          ))}
          {skills.length === 0 && (
            <div className="p-8 text-center text-sm text-zinc-400">
              Belum ada skill terdeteksi. Jalankan Scrape Next di halaman Targets — deskripsi lowongan baru otomatis ikut dianalisis.
            </div>
          )}
        </div>
      )}
      <div className="text-xs text-zinc-400">
        {mode === "history"
          ? "Mode Riwayat: angka = jumlah lowongan yang pernah menyebut skill itu (termasuk yang sudah dihapus/Sampah). Cocok untuk mencatat skill yang sering keluar lalu dipelajari. Pindah ke mode Aktif untuk melihat komposisi lowongan yang tersedia saat ini."
          : "Mode Aktif: angka = jumlah lowongan aktif yang menyebut skill itu. % = porsi dari total lowongan aktif pada filter ini. Data lama (sebelum update ini) hanya dihitung dari judul sampai re-scrape berjalan."}
      </div>
    </div>
  );
}
