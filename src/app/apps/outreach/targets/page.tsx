"use client";
import { useEffect, useState } from "react";
import { OUTREACH_API, apiFetch } from "@/lib/api";
import { SearchTarget } from "@/lib/types";
import { Pagination } from "@/components/pagination";

export default function TargetsPage() {
  const [targets, setTargets] = useState<SearchTarget[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(false);

  async function load(p: number, status: string) {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    params.set("page", String(p));
    const d = await apiFetch(`${OUTREACH_API}/targets?${params}`).then(r => r.json()) as { targets: SearchTarget[]; counts: { total: number; byStatus: Record<string, number> }; page: number; pageSize: number; total: number };
    setTargets(d.targets);
    setCounts(d.counts.byStatus);
    setTotal(d.total);
  }
  useEffect(() => { load(page, statusFilter); }, [page, statusFilter]);

  async function seed() {
    setBusy(true);
    await apiFetch(`${OUTREACH_API}/admin/seed`, { method: "POST" });
    await load(page, statusFilter);
    setBusy(false);
  }
  async function scrape() {
    setBusy(true);
    await apiFetch(`${OUTREACH_API}/admin/scrape-next`, { method: "POST" });
    await load(page, statusFilter);
    setBusy(false);
  }
  async function retryFailed() {
    setBusy(true);
    const res = await apiFetch(`${OUTREACH_API}/admin/targets/retry-failed`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) alert((data as { error?: string }).error || "Gagal retry");
    setPage(1);
    await load(1, statusFilter);
    setBusy(false);
  }
  async function reset() {
    if (!confirm("Reset total? Raw + Leads + antrian akan dikosongkan dan semua target kembali ke PENDING.")) return;
    setBusy(true);
    const res = await apiFetch(`${OUTREACH_API}/admin/reset`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) alert((data as { error?: string }).error || "Gagal reset");
    setPage(1);
    await load(1, statusFilter);
    setBusy(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h1 className="text-xl font-bold">Targets ({total})</h1>
        <div className="flex flex-wrap gap-2">
          <select className="input w-auto !py-1.5 text-sm" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">Semua status</option>
            <option value="PENDING">PENDING</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="DONE">DONE</option>
            <option value="FAILED">FAILED</option>
          </select>
          <button className="btn-secondary text-sm" onClick={seed} disabled={busy}>Seed 10.280</button>
          <button className="btn-primary text-sm" onClick={scrape} disabled={busy}>Scrape Next</button>
          <button className="btn-secondary text-sm" onClick={retryFailed} disabled={busy}>Retry FAILED</button>
          <button className="btn-secondary text-sm !text-rose-600" onClick={reset} disabled={busy}>Reset</button>
        </div>
      </div>
      <div className="text-sm text-zinc-500">PENDING {counts["PENDING"] ?? 0} · DONE {counts["DONE"] ?? 0} · FAILED {counts["FAILED"] ?? 0} · PROCESSING {counts["PROCESSING"] ?? 0}</div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-xs text-zinc-500 border-b"><th className="px-3 py-2 text-left">Keyword</th><th className="px-3 py-2 text-left">Status</th><th className="px-3 py-2 text-left">Attempts</th></tr></thead>
          <tbody>
            {targets.map(t => (
              <tr key={t.id} className="border-b"><td className="px-3 py-2">{t.keyword}</td><td className="px-3 py-2">{t.status}</td><td className="px-3 py-2">{t.attempts}</td></tr>
            ))}
            {targets.length === 0 && (
              <tr><td colSpan={3} className="px-3 py-8 text-center text-zinc-400">Tidak ada target.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination page={page} total={total} onChange={setPage} />
    </div>
  );
}
