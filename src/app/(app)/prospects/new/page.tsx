"use client";
import { apiFetch } from "@/lib/api";

import { useState } from "react";

export default function NewProspectPage() {
  const [form, setForm] = useState({
    name: "",
    company: "",
    channel: "linkedin",
    contact: "",
    segment: "",
    notes: "",
  });
  const [csv, setCsv] = useState("");
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);

  async function submitSingle(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setBusy(true);
    const res = await apiFetch("/api/prospects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setBusy(false);
    if (res.ok) {
      setResult("Prospek ditambahkan.");
      setForm({ name: "", company: "", channel: "linkedin", contact: "", segment: "", notes: "" });
    } else {
      setResult("Gagal menambah prospek.");
    }
  }

  async function submitCsv(e: React.FormEvent) {
    e.preventDefault();
    if (!csv.trim()) return;
    setBusy(true);
    const res = await apiFetch("/api/prospects/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv }),
    });
    const data = (await res.json().catch(() => ({}))) as { imported?: number };
    setBusy(false);
    setResult(
      res.ok ? `Berhasil import ${data.imported} prospek.` : "Gagal import CSV."
    );
    setCsv("");
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Tambah Prospek</h1>
        <p className="text-sm text-zinc-500">
          Tambah manual satu per satu atau import massal via CSV.
        </p>
      </div>

      {result && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-700 rounded-lg px-4 py-2 text-sm">
          {result}
        </div>
      )}

      <div className="card p-5">
        <h2 className="font-semibold text-zinc-900 mb-4">Tambah manual</h2>
        <form onSubmit={submitSingle} className="space-y-3">
          <div>
            <label className="label">Nama *</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Perusahaan</label>
            <input
              className="input"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Kanal</label>
              <select
                className="input"
                value={form.channel}
                onChange={(e) => setForm({ ...form, channel: e.target.value })}
              >
                <option value="linkedin">LinkedIn</option>
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="other">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="label">Kontak (handle/email/WA)</label>
              <input
                className="input"
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label">Segmen/bidang bisnis</label>
            <input
              className="input"
              value={form.segment}
              onChange={(e) => setForm({ ...form, segment: e.target.value })}
              placeholder="cth: klinik, restoran, toko online"
            />
          </div>
          <div>
            <label className="label">Catatan</label>
            <textarea
              className="input"
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <button className="btn-primary" disabled={busy}>
            Simpan Prospek
          </button>
        </form>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-zinc-900 mb-1">Import CSV massal</h2>
        <p className="text-xs text-zinc-500 mb-3">
          Format: <code>name,company,channel,contact,segment,notes</code> per baris,
          header baris pertama.
        </p>
        <form onSubmit={submitCsv} className="space-y-3">
          <textarea
            className="input font-mono"
            rows={6}
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            placeholder={"name,company,channel,contact,segment,notes\nAndi,Warung Berkah,whatsapp,0812xxxx,warung,\nBudi,CV Maju,linkedin,budi.linkedin,konstruksi,"}
          />
          <button className="btn-secondary" disabled={busy}>
            Import CSV
          </button>
        </form>
      </div>
    </div>
  );
}
