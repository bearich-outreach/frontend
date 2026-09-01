"use client";
import { OUTREACH_API, apiFetch } from "@/lib/api";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, Prospect, SequenceStep } from "@/lib/types";
import { StatusBadge, CopyButton } from "@/components/bits";
import { fmtDateTime } from "@/lib/format";

const STATUS_ACTIONS = [
  { status: "replied", label: "Replied" },
  { status: "interested", label: "Interested" },
  { status: "closed", label: "Closed" },
  { status: "dead", label: "Dead" },
] as const;

export function ProspectClient({
  prospect: initial,
  activities: initialActs,
  sequence,
}: {
  prospect: Prospect;
  activities: Activity[];
  sequence: SequenceStep[];
}) {
  const router = useRouter();
  const [p, setP] = useState(initial);
  const [acts, setActs] = useState(initialActs);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: p.name,
    company: p.company ?? "",
    channel: p.channel,
    contact: p.contact ?? "",
    segment: p.segment ?? "",
    notes: p.notes ?? "",
  });
  const [message, setMessage] = useState("");
  const [usedAI, setUsedAI] = useState(false);
  const [step, setStep] = useState(Math.min(p.followUpStep, sequence.length - 1));
  const [note, setNote] = useState("");
  const [value, setValue] = useState(p.closedValue?.toString() ?? "");
  const [busy, setBusy] = useState(false);

  const nextStep = Math.min(p.followUpStep, sequence.length - 1);

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await apiFetch(`${OUTREACH_API}/prospects/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = (await res.json()) as { prospect: Prospect };
      setP(data.prospect);
      setEditing(false);
    }
    setBusy(false);
  }

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await apiFetch(`${OUTREACH_API}/prospects/${p.id}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step }),
    });
    const data = (await res.json()) as { message: string; usedAI: boolean };
    setMessage(data.message);
    setUsedAI(data.usedAI);
    setBusy(false);
  }

  async function markSent() {
    setBusy(true);
    const res = await apiFetch(`${OUTREACH_API}/prospects/${p.id}/advance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    if (res.ok) {
      const data = (await res.json()) as { prospect: Prospect };
      setP(data.prospect);
      setMessage("");
      refreshActs();
    }
    setBusy(false);
  }

  function parseCurrency(str: string): number {
    if (!str) return 0;
    const clean = str.replace(/[^0-9]/g, "");
    const val = Number(clean);
    return isNaN(val) ? 0 : val;
  }

  async function setStatus(s: string) {
    setBusy(true);
    const body: Record<string, unknown> = { status: s };
    if (s === "closed" && value) body.value = parseCurrency(value);
    const res = await apiFetch(`${OUTREACH_API}/prospects/${p.id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data = (await res.json()) as { prospect: Prospect };
      setP(data.prospect);
      refreshActs();
    }
    setBusy(false);
  }

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    await apiFetch(`${OUTREACH_API}/prospects/${p.id}/note`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });
    setNote("");
    refreshActs();
  }

  async function remove() {
    if (!confirm("Hapus prospek ini?")) return;
    await apiFetch(`${OUTREACH_API}/prospects/${p.id}`, { method: "DELETE" });
    router.push("/apps/outreach/prospects");
  }

  async function refreshActs() {
    const res = await apiFetch(`${OUTREACH_API}/prospects/${p.id}/activities`);
    const data = (await res.json()) as { activities: Activity[] };
    setActs(data.activities);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-zinc-900">{p.name}</h1>
            <StatusBadge status={p.status} />
          </div>
          <p className="text-sm text-zinc-500">
            {p.company ? `${p.company} · ` : ""}
            {p.segment ? `${p.segment} · ` : ""}
            <span className="capitalize">{p.channel}</span>
            {p.contact ? ` · ${p.contact}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-secondary" onClick={() => setEditing(!editing)}>
            Edit
          </button>
          <button className="btn-danger" onClick={remove}>
            Hapus
          </button>
        </div>
      </div>

      {editing && (
        <form onSubmit={saveEdit} className="card p-5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Nama</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Perusahaan</label>
              <input className="input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
            <div>
              <label className="label">Kanal</label>
              <select className="input" value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
                <option value="linkedin">LinkedIn</option>
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="other">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="label">Kontak</label>
              <input className="input" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="label">Segmen</label>
              <input className="input" value={form.segment} onChange={(e) => setForm({ ...form, segment: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="label">Catatan</label>
              <textarea className="input" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-primary" disabled={busy}>Simpan</button>
            <button className="btn-secondary" onClick={() => setEditing(false)}>Batal</button>
          </div>
        </form>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="card p-5">
            <h2 className="font-semibold text-zinc-900 mb-3">
              Generate Pesan (step {step + 1}/{sequence.length})
            </h2>
            <form onSubmit={generate} className="space-y-3">
              <div>
                <label className="label">Pilih langkah follow-up</label>
                <select className="input" value={step} onChange={(e) => setStep(Number(e.target.value))}>
                  {sequence.map((s, i) => (
                    <option key={s.id} value={i}>
                      Step {i + 1} (delay {s.delayDays} hari)
                    </option>
                  ))}
                </select>
              </div>
              {message && (
                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-sm whitespace-pre-wrap dark:bg-zinc-800/60 dark:border-zinc-700 dark:text-zinc-100">
                  {message}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <button className="btn-primary" disabled={busy}>
                  {usedAI ? "Regenerate (AI)" : "Generate Pesan"}
                </button>
                {message && <CopyButton text={message} />}
                {message && (
                  <button className="btn-secondary" onClick={markSent} disabled={busy}>
                    Tandai Terkirim
                  </button>
                )}
              </div>
              <p className="text-xs text-zinc-400">
                {usedAI
                  ? "Pesan dihasilkan AI dari konfigurasi Settings."
                  : "Fallback template (AI belum dikonfigurasi — isi API key di Settings untuk pesan lebih personal)."}
              </p>
            </form>
          </div>

          <div className="card p-5">
            <h2 className="font-semibold text-zinc-900 mb-3">Pipeline</h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {STATUS_ACTIONS.map((a) => (
                <button key={a.status} className="btn-secondary" onClick={() => setStatus(a.status)} disabled={busy}>
                  {a.label}
                </button>
              ))}
            </div>
            {p.status === "closed" && (
              <div className="flex flex-wrap items-center gap-2">
                <input
                  className="input"
                  placeholder="Nilai deal (Rp)"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
                <button className="btn-secondary" onClick={() => setStatus("closed")} disabled={busy}>
                  Update Nilai
                </button>
              </div>
            )}
            <div className="text-xs text-zinc-500 mt-2">
              Follow-up terkirim: {p.followUpStep}/{sequence.length}.{" "}
              {p.nextFollowUpAt
                ? `Jatuh tempo ${fmtDateTime(p.nextFollowUpAt)}.`
                : "Follow-up selesai / berhenti."}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h2 className="font-semibold text-zinc-900 mb-3">Aktivitas</h2>
            <form onSubmit={addNote} className="flex gap-2 mb-3">
              <input
                className="input"
                placeholder="Tambah catatan..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <button className="btn-secondary">Tambah</button>
            </form>
            <ul className="space-y-2 text-sm max-h-80 overflow-y-auto">
              {acts.map((a) => (
                <li key={a.id} className="flex gap-2 items-start">
                  <span className="shrink-0 text-[10px] uppercase font-bold text-zinc-400 mt-0.5">
                    {a.type}
                  </span>
                  <div className="flex-1">
                    {a.message && (
                      <div className="text-zinc-700 whitespace-pre-wrap break-words">{a.message}</div>
                    )}
                    <div className="text-xs text-zinc-400">{fmtDateTime(a.createdAt)}</div>
                  </div>
                </li>
              ))}
              {acts.length === 0 && (
                <li className="text-zinc-400">Belum ada aktivitas.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}