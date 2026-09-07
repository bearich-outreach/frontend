"use client";
import { OUTREACH_API, apiFetch } from "@/lib/api";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { QualifiedLead } from "@/lib/types";

export default function OutreachQueuePage() {
  const [leads, setLeads] = useState<QualifiedLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = await apiFetch(`${OUTREACH_API}/queue`).then((r) => r.json()) as { due: QualifiedLead[] };
      setLeads(q.due);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function sendWA(l: QualifiedLead) {
    if (!confirm(`Kirim WA ke ${l.name} (${l.phone628})?`)) return;
    setSendingId(l.id);
    try {
      const res = await apiFetch(`${OUTREACH_API}/leads/${l.id}/send`, {
        method: "POST",
        body: JSON.stringify({ message: l.message }),
      });
      if (res.ok) {
        setLeads((prev) => prev.filter((x) => x.id !== l.id));
      } else {
        const data = await res.json().catch(() => ({}));
        alert((data as { error?: string }).error || "Gagal kirim WA");
      }
    } catch {
      alert("Gagal kirim WA");
    }
    setSendingId("");
  }

  if (loading) return <p className="text-zinc-500">Memuat antrian...</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold dark:text-zinc-50">Antrian Kirim ({leads.length})</h1>
          <p className="text-sm text-zinc-500">Pengiriman manual via tombol — tidak ada kirim otomatis.</p>
        </div>
        <button className="btn-secondary text-sm" onClick={load}>Refresh</button>
      </div>

      {leads.length === 0 ? (
        <div className="card p-8 text-center text-zinc-400">Tidak ada New Lead menunggu.</div>
      ) : (
        <div className="space-y-3">
          {leads.slice(0, 20).map((l) => (
            <div key={l.id} className="card p-4">
              <div className="flex justify-between gap-2">
                <div>
                  <div className="font-semibold"><Link href={`/apps/outreach/prospects/${l.id}`} className="hover:underline">{l.name}</Link> · {l.city}</div>
                  <div className="text-xs text-zinc-500">{l.category} · Skor {l.score} · WA ✓ · {l.phone628}</div>
                  {l.address && <div className="text-xs text-zinc-500">{l.address}</div>}
                  {l.mapsUrl && <a href={l.mapsUrl} target="_blank" rel="noreferrer" className="text-xs text-sky-600 hover:underline">Lihat di Maps</a>}
                </div>
                <span className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-700 h-fit">{l.status}</span>
              </div>
              {l.message && <div className="mt-2 text-sm bg-zinc-50 dark:bg-zinc-800 p-2 rounded whitespace-pre-wrap">{l.message}</div>}
              <button className="btn-primary text-xs px-3 py-1.5 mt-2" onClick={() => sendWA(l)} disabled={sendingId === l.id}>
                {sendingId === l.id ? "Mengirim..." : "Kirim WA"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
