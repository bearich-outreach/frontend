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

  async function post(path: string, confirmMsg?: string) {
    if (confirmMsg && !confirm(confirmMsg)) return;
    setBusy(true);
    await apiFetch(`${JOBS_API}${path}`, { method: "POST" });
    setPage(1);
    await load(1, status);
    setBusy(false);
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
          <button className="btn-secondary text-sm" onClick={() => post("/admin/seed")} disabled={busy}>Seed 42</button>
          <button className="btn-primary text-sm" onClick={() => post("/admin/scrape-next")} disabled={busy}>Scrape Next</button>
          <button className="btn-secondary text-sm" onClick={() => post("/admin/targets/retry-failed")} disabled={busy}>Retry FAILED</button>
          <button className="btn-secondary text-sm !text-rose-600" onClick={() => post("/admin/reset", "Reset jobs only? Raw + listings dikosongkan, targets ke PENDING. App lain tidak tersentuh.")} disabled={busy}>Reset Jobs Only</button>
        </div>
      </div>
      <div className="text-sm text-zinc-500">PENDING {counts["PENDING"] ?? 0} · DONE {counts["DONE"] ?? 0} · FAILED {counts["FAILED"] ?? 0} · 1 keyword/15 mnt, max 10/hari</div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-xs text-zinc-500 border-b"><th className="px-3 py-2 text-left">Keyword</th><th className="px-3 py-2 text-left">Sumber</th><th className="px-3 py-2 text-left">Status</th><th className="px-3 py-2 text-left">Attempts</th></tr></thead>
          <tbody>
            {targets.map((t) => (
              <tr key={t.id} className="border-b"><td className="px-3 py-2">{t.keyword}</td><td className="px-3 py-2">{t.source}</td><td className="px-3 py-2">{t.status}</td><td className="px-3 py-2">{t.attempts}</td></tr>
            ))}
            {targets.length === 0 && <tr><td colSpan={4} className="px-3 py-8 text-center text-zinc-400">Tidak ada target.</td></tr>}
          </tbody>
        </table>
      </div>
      <Pagination page={page} total={total} onChange={setPage} />
    </div>
  );
}
