"use client";
import { OUTREACH_API, apiFetch } from "@/lib/api";
import { useState } from "react";
import { QualifiedLead } from "@/lib/types";

export function ProspectClient({ lead: initial }: { lead: QualifiedLead }) {
  const [l, setL] = useState(initial);
  const [busy, setBusy] = useState(false);
  const canFollowup = l.status === "Replied" && l.repliedAt && (Date.now() - new Date(l.repliedAt).getTime()) >= 3*24*60*60*1000;

  async function sendWA() {
    if (!confirm(`Kirim WA ke ${l.name} (${l.phone628})?`)) return;
    setBusy(true);
    const res = await apiFetch(`${OUTREACH_API}/leads/${l.id}/send`, { method: "POST", body: JSON.stringify({ message: l.message }) });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setL({ ...l, status: "Contacted" });
    } else {
      alert((data as { error?: string }).error || "Gagal kirim WA");
    }
    setBusy(false);
  }

  async function followup() {
    setBusy(true);
    const res = await apiFetch(`${OUTREACH_API}/leads/${l.id}/followup-replied`, { method: "POST", body: JSON.stringify({ message: l.message }) });
    if (res.ok) alert("Follow-up terkirim");
    setBusy(false);
  }

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <h1 className="text-xl font-bold">{l.name}</h1>
        <p className="text-sm text-zinc-500">{l.city} · {l.category} · Skor {l.score} · WA {l.phone628} · {l.status}</p>
        {l.address && <p className="text-sm text-zinc-600 mt-1">{l.address}</p>}
        {l.mapsUrl && <a href={l.mapsUrl} target="_blank" rel="noreferrer" className="text-sm text-sky-600 hover:underline">Lihat di Maps</a>}
        <p className="text-xs text-zinc-400 mt-1">Rating {l.rating} · {l.reviewCount} ulasan · {l.website || "tanpa website"}</p>
        {l.message && <div className="mt-3 bg-zinc-50 dark:bg-zinc-800 p-3 rounded text-sm whitespace-pre-wrap">{l.message}</div>}
      </div>

      {l.status === "New Lead" && (
        <div className="card p-4">
          <h2 className="font-semibold mb-2">Kirim WA manual</h2>
          <p className="text-xs text-zinc-500 mb-3">Pengiriman otomatis dimatikan. Klik tombol untuk mengirim pesan di atas.</p>
          <button className="btn-primary text-sm" onClick={sendWA} disabled={busy}>{busy ? "Mengirim..." : "Kirim WA"}</button>
        </div>
      )}

      {canFollowup ? (
        <div className="card p-4">
          <h2 className="font-semibold mb-2">Follow-up Replied (3 hari)</h2>
          <p className="text-xs text-zinc-500 mb-3">Balasan sudah 3 hari lalu, klik untuk kirim follow-up.</p>
          <button className="btn-primary text-sm" onClick={followup} disabled={busy}>Kirim Follow-up</button>
        </div>
      ) : l.status === "Replied" ? (
        <div className="card p-4 text-sm text-zinc-500">Follow-up tersedia setelah 3 hari dari {l.repliedAt ? new Date(l.repliedAt).toLocaleDateString("id-ID") : "-"}</div>
      ) : null}
    </div>
  );
}
