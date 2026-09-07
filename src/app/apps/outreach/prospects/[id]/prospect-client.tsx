"use client";
import { OUTREACH_API, apiFetch } from "@/lib/api";
import { useState } from "react";
import { QualifiedLead } from "@/lib/types";

export function ProspectClient({ lead: initial }: { lead: QualifiedLead }) {
  const [l, setL] = useState(initial);
  const [busy, setBusy] = useState(false);
  const canFollowup = l.status === "Replied" && l.repliedAt && (Date.now() - new Date(l.repliedAt).getTime()) >= 3*24*60*60*1000;

  async function followup() {
    setBusy(true);
    const res = await apiFetch(`${OUTREACH_API}/leads/${l.id}/followup-replied`, { method: "POST", body: JSON.stringify({ message: l.message }) });
    if (res.ok) alert("Follow-up terkirim (dry-run jika DRY_RUN=true)");
    setBusy(false);
  }

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <h1 className="text-xl font-bold">{l.name}</h1>
        <p className="text-sm text-zinc-500">{l.city} · {l.category} · Skor {l.score} · WA {l.phone628} · {l.status}</p>
        <p className="text-xs text-zinc-400">Rating {l.rating} · {l.reviewCount} ulasan · {l.website || "tanpa website"}</p>
        {l.message && <div className="mt-3 bg-zinc-50 dark:bg-zinc-800 p-3 rounded text-sm whitespace-pre-wrap">{l.message}</div>}
      </div>

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
