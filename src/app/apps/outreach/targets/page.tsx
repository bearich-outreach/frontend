"use client";
import { useEffect, useState } from "react";
import { OUTREACH_API, apiFetch } from "@/lib/api";
import { SearchTarget } from "@/lib/types";

export default function TargetsPage() {
  const [targets, setTargets] = useState<SearchTarget[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);

  async function load() {
    const d = await apiFetch(`${OUTREACH_API}/targets`).then(r => r.json()) as { targets: SearchTarget[]; counts: { total: number; byStatus: Record<string, number> } };
    setTargets(d.targets);
    setCounts(d.counts.byStatus);
  }
  useEffect(() => { load(); }, []);

  async function seed() {
    setBusy(true);
    await apiFetch(`${OUTREACH_API}/admin/seed`, { method: "POST" });
    await load();
    setBusy(false);
  }
  async function scrape() {
    setBusy(true);
    await apiFetch(`${OUTREACH_API}/admin/scrape-next`, { method: "POST" });
    await load();
    setBusy(false);
  }
  async function reset() {
    if (!confirm("Reset total? Raw + Leads + antrian akan dikosongkan dan semua target kembali ke PENDING.")) return;
    setBusy(true);
    const res = await apiFetch(`${OUTREACH_API}/admin/reset`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) alert((data as { error?: string }).error || "Gagal reset");
    await load();
    setBusy(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Targets (10.280)</h1>
        <div className="flex gap-2">
          <button className="btn-secondary text-sm" onClick={seed} disabled={busy}>Seed 10.280</button>
          <button className="btn-primary text-sm" onClick={scrape} disabled={busy}>Scrape Next</button>
          <button className="btn-secondary text-sm !text-rose-600" onClick={reset} disabled={busy}>Reset</button>
        </div>
      </div>
      <div className="text-sm text-zinc-500">PENDING {counts["PENDING"] ?? 0} · DONE {counts["DONE"] ?? 0} · FAILED {counts["FAILED"] ?? 0} · PROCESSING {counts["PROCESSING"] ?? 0}</div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-xs text-zinc-500 border-b"><th className="px-3 py-2">Keyword</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Attempts</th></tr></thead>
          <tbody>
            {targets.slice(0, 100).map(t => (
              <tr key={t.id} className="border-b"><td className="px-3 py-2">{t.keyword}</td><td className="px-3 py-2">{t.status}</td><td className="px-3 py-2">{t.attempts}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
