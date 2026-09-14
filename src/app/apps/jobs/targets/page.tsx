"use client";
import { useEffect, useState } from "react";
import { JOBS_API, apiFetch } from "@/lib/api";
import { JobTarget } from "@/lib/types";
import { Pagination } from "@/components/pagination";

export default function JobsTargetsPage() {
  const [targets, setTargets] = useState<JobTarget[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(false);

  async function load(p: number, st: string) {
    const params = new URLSearchParams();
    if (st) params.set("status", st);
    params.set("page", String(p));
    const d = await apiFetch(`${JOBS_API}/targets?${params}`).then((r) => r.json()) as { targets: JobTarget[]; counts: { total: number; byStatus: Record<string, number> }; total: number };
    setTargets(d.targets);
    setCounts(d.counts.byStatus);
    setTotal(d.total);
  }
  useEffect(() => { load(page, status); }, [page, status]);

  async function post(path: string) {
    setBusy(true);
    try {
      const res = await apiFetch(`${JOBS_API}${path}`, { method: "POST" });
      const data = await res.json().catch(() => ({})) as { noEligible?: boolean; recycled?: boolean; keyword?: string; source?: string };
      if (data?.noEligible) alert("Tidak ada keyword yang siap. Semua DONE masih dalam jeda 24 jam atau FAILED butuh Retry manual.");
      else if (data?.recycled) alert(`Putar ulang: ${data.keyword} (${data.source}) — keyword lama dicari lagi.`);
    } finally {
      setPage(1);
      await load(1, status);
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h1 className="text-xl font-bold">Targets ({total})</h1>
        <div className="flex flex-wrap gap-2">
          <select className="input w-auto !py-1.5 text-sm" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">Semua</option>
            <option value="PENDING">PENDING</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="DONE">DONE</option>
            <option value="FAILED">FAILED</option>
          </select>
          <button className="btn-secondary text-sm" onClick={() => post("/admin/seed")} disabled={busy}>Seed 63</button>
          <button className="btn-primary text-sm" onClick={() => post("/admin/scrape-next")} disabled={busy}>Scrape Next</button>
          <button className="btn-secondary text-sm" onClick={() => post("/admin/targets/retry-failed")} disabled={busy}>Retry FAILED</button>
        </div>
      </div>
      <div className="text-sm text-zinc-500">PENDING {counts["PENDING"] ?? 0} · DONE {counts["DONE"] ?? 0} · FAILED {counts["FAILED"] ?? 0} · Putaran 63 keyword, jeda 24 jam · Glints tiap 15 mnt, JobStreet+Indeed max 1x/jam</div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-xs text-zinc-500 border-b"><th className="px-3 py-2 text-left">Keyword</th><th className="px-3 py-2 text-left">Sumber</th><th className="px-3 py-2 text-left">Status</th><th className="px-3 py-2 text-left">Attempts</th><th className="px-3 py-2 text-left">Terakhir jalan</th></tr></thead>
          <tbody>
            {targets.map((t) => (
              <tr key={t.id} className="border-b"><td className="px-3 py-2">{t.keyword}</td><td className="px-3 py-2">{t.source}</td><td className="px-3 py-2">{t.status}</td><td className="px-3 py-2">{t.attempts}</td><td className="px-3 py-2 text-zinc-500">{t.updatedAt ? new Date(t.updatedAt).toLocaleString("id-ID") : "-"}</td></tr>
            ))}
            {targets.length === 0 && <tr><td colSpan={5} className="px-3 py-8 text-center text-zinc-400">Tidak ada target.</td></tr>}
          </tbody>
        </table>
      </div>
      <Pagination page={page} total={total} onChange={setPage} />
    </div>
  );
}
