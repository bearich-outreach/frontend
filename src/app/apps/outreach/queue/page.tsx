"use client";
import { OUTREACH_API, apiFetch } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";
import { QualifiedLead } from "@/lib/types";

export default function OutreachQueuePage() {
  const [leads, setLeads] = useState<QualifiedLead[]>([]);
  const [status, setStatus] = useState<{ dryRun: boolean; dailySent: number; operational: boolean; wibTime: string; deepseekMode: "deepseek" | "spintax" } | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [q, s] = await Promise.all([
        apiFetch(`${OUTREACH_API}/queue`).then((r) => r.json()) as Promise<{ due: QualifiedLead[] }>,
        apiFetch(`${OUTREACH_API}/scheduler/status`).then((r) => r.json()),
      ]);
      setLeads(q.due);
      setStatus(s);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <p className="text-zinc-500">Memuat monitor...</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold dark:text-zinc-50">Queue Monitor (Autopilot)</h1>
          <p className="text-sm text-zinc-500">
            {status?.dryRun ? "DRY-RUN aktif (2 hari pertama, tidak kirim WA real)" : "Full auto aktif"} · {status?.dailySent ?? 0}/10 hari ini · {status?.operational ? "Jam operasional 09-16 WIB" : "Di luar jam operasional"} · WIB {status?.wibTime ? new Date(status.wibTime).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }) : "-"} · {status?.deepseekMode === "deepseek" ? "● DeepSeek" : "○ Spintax"} (toggle di Settings, auto Spintax jika kredit habis)
          </p>
        </div>
        <button className="btn-secondary text-sm" onClick={load}>Refresh</button>
      </div>

      <div className="card p-4 text-sm">
        <p className="text-zinc-600 dark:text-zinc-300">Scheduler berjalan tiap menit, interval acak 30-50 menit, Senin-Jumat 09-16 WIB, tepat 10/hari. Webhook 24/7 tetap terima balasan. Follow-up Replied butuh klik setelah 3 hari.</p>
      </div>

      {leads.length === 0 ? (
        <div className="card p-8 text-center text-zinc-400">Tidak ada New Lead menunggu. Buffer &lt;10 akan trigger scrape otomatis.</div>
      ) : (
        <div className="space-y-3">
          {leads.slice(0, 20).map((l) => (
            <div key={l.id} className="card p-4">
              <div className="flex justify-between gap-2">
                <div>
                  <div className="font-semibold">{l.name} · {l.city}</div>
                  <div className="text-xs text-zinc-500">{l.category} · Skor {l.score} · WA {l.waVerified ? "✓" : "—"} · {l.phone628}</div>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-700">{l.status}</span>
              </div>
              {l.message && <div className="mt-2 text-sm bg-zinc-50 dark:bg-zinc-800 p-2 rounded whitespace-pre-wrap">{l.message}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
