"use client";
import { OUTREACH_API, apiFetch } from "@/lib/api";
import { useState } from "react";
import { QualifiedLead } from "@/lib/types";

export function ProspectClient({ lead: initial }: { lead: QualifiedLead }) {
  const [l, setL] = useState(initial);
  const [msg, setMsg] = useState(initial.message ?? "");
  const [busy, setBusy] = useState<"save" | "regen" | "send" | "followup" | "">("");
  const [notice, setNotice] = useState("");
  const dirty = msg !== (l.message ?? "");
  const canFollowup = l.status === "Replied" && l.repliedAt && (Date.now() - new Date(l.repliedAt).getTime()) >= 3*24*60*60*1000;

  function flash(text: string) {
    setNotice(text);
    setTimeout(() => setNotice(""), 2500);
  }

  async function saveMessage() {
    if (!msg.trim()) { alert("Pesan tidak boleh kosong"); return; }
    setBusy("save");
    const res = await apiFetch(`${OUTREACH_API}/leads/${l.id}`, {
      method: "PATCH",
      body: JSON.stringify({ message: msg }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setL((data as { lead: QualifiedLead }).lead ?? { ...l, message: msg });
      flash("Pesan disimpan.");
    } else {
      alert((data as { error?: string }).error || "Gagal menyimpan pesan");
    }
    setBusy("");
  }

  async function regenerate() {
    if (dirty && !confirm("Buat ulang pesan? Edit yang belum disimpan akan hilang.")) return;
    setBusy("regen");
    const res = await apiFetch(`${OUTREACH_API}/leads/${l.id}/regenerate`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      const updated = (data as { lead: QualifiedLead }).lead;
      setL(updated);
      setMsg(updated.message ?? "");
      flash("Pesan baru dibuat.");
    } else {
      alert((data as { error?: string }).error || "Gagal membuat ulang pesan");
    }
    setBusy("");
  }

  function useVariant(v: string) {
    setMsg(v);
  }

  async function sendWA() {
    if (dirty && !confirm("Ada edit belum disimpan. Kirim dengan pesan tersimpan lama?")) return;
    if (!confirm(`Kirim WA ke ${l.name} (${l.phone628})?`)) return;
    setBusy("send");
    const res = await apiFetch(`${OUTREACH_API}/leads/${l.id}/send`, { method: "POST", body: JSON.stringify({}) });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setL({ ...l, status: "Contacted" });
    } else {
      alert((data as { error?: string }).error || "Gagal kirim WA");
    }
    setBusy("");
  }

  async function followup() {
    setBusy("followup");
    const res = await apiFetch(`${OUTREACH_API}/leads/${l.id}/followup-replied`, { method: "POST", body: JSON.stringify({ message: l.message }) });
    if (res.ok) alert("Follow-up terkirim");
    setBusy("");
  }

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <h1 className="text-xl font-bold">{l.name}</h1>
        <p className="text-sm text-zinc-500">{l.city} · {l.category} · Skor {l.score} · WA {l.phone628} · {l.status}</p>
        {l.address && <p className="text-sm text-zinc-600 mt-1">{l.address}</p>}
        {l.mapsUrl && <a href={l.mapsUrl} target="_blank" rel="noreferrer" className="text-sm text-sky-600 hover:underline">Lihat di Maps</a>}
        <p className="text-xs text-zinc-400 mt-1">Rating {l.rating} · {l.reviewCount} ulasan · {l.website || "tanpa website"}</p>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">Pesan WA</h2>
          <button className="btn-secondary text-xs px-3 py-1.5" onClick={regenerate} disabled={busy !== ""}>
            {busy === "regen" ? "Membuat..." : "Buat ulang"}
          </button>
        </div>
        <textarea
          className="input min-h-28"
          rows={5}
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="Tulis pesan WA..."
        />
        <div className="flex items-center gap-2 mt-2">
          <button className="btn-primary text-sm" onClick={saveMessage} disabled={busy !== "" || !dirty}>
            {busy === "save" ? "Menyimpan..." : "Simpan pesan"}
          </button>
          {dirty && <span className="text-xs text-amber-600">Ada perubahan belum disimpan</span>}
          {notice && <span className="text-xs text-emerald-600">{notice}</span>}
        </div>
        {l.messageVariants && l.messageVariants.length > 1 && (
          <div className="mt-3">
            <p className="text-xs text-zinc-500 mb-1">Varian lain (klik untuk dipakai):</p>
            <div className="space-y-1.5">
              {l.messageVariants.filter((v) => v !== l.message).map((v, i) => (
                <button
                  key={i}
                  onClick={() => useVariant(v)}
                  className="block w-full text-left text-xs bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 p-2 rounded whitespace-pre-wrap"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {l.status === "New Lead" && (
        <div className="card p-4">
          <h2 className="font-semibold mb-2">Kirim WA manual</h2>
          <p className="text-xs text-zinc-500 mb-3">Terkirim memakai pesan tersimpan. Simpan dulu bila baru diedit.</p>
          <button className="btn-primary text-sm" onClick={sendWA} disabled={busy !== ""}>{busy === "send" ? "Mengirim..." : "Kirim WA"}</button>
        </div>
      )}

      {canFollowup ? (
        <div className="card p-4">
          <h2 className="font-semibold mb-2">Follow-up Replied (3 hari)</h2>
          <p className="text-xs text-zinc-500 mb-3">Balasan sudah 3 hari lalu, klik untuk kirim follow-up.</p>
          <button className="btn-primary text-sm" onClick={followup} disabled={busy !== ""}>Kirim Follow-up</button>
        </div>
      ) : l.status === "Replied" ? (
        <div className="card p-4 text-sm text-zinc-500">Follow-up tersedia setelah 3 hari dari {l.repliedAt ? new Date(l.repliedAt).toLocaleDateString("id-ID") : "-"}</div>
      ) : null}
    </div>
  );
}
