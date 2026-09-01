"use client";
import { OUTREACH_API, apiFetch } from "@/lib/api";

import { useEffect, useState } from "react";
import { SequenceStep, Settings } from "@/lib/types";

export default function SettingsPage() {
  const [s, setS] = useState<Settings | null>(null);
  const [servicesText, setServicesText] = useState("");
  const [seqText, setSeqText] = useState("");
  const [saved, setSaved] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch(`${OUTREACH_API}/settings`)
      .then((r) => r.json())
      .then((data: { settings: Settings }) => {
        setS(data.settings);
        setServicesText(data.settings.services.join("\n"));
        setSeqText(
          data.settings.sequence
            .map((st) => `[${st.delayDays}] ${st.template}`)
            .join("\n\n")
        );
      })
      .catch(() => {
        setError("Tidak dapat terhubung ke server API. Pastikan backend berjalan, lalu muat ulang.");
      });
  }, []);

  async function save() {
    if (!s) return;
    const parsedSeq = parseSequence(seqText);
    if (parsedSeq.length === 0) {
      alert("Sequence follow-up harus memiliki minimal 1 langkah valid dalam format [delayInDays] template.");
      return;
    }
    setBusy(true);
    const body: Record<string, unknown> = {
      ...s,
      services: servicesText
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean),
      sequence: parsedSeq,
    };
    const res = await apiFetch(`${OUTREACH_API}/settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data = (await res.json()) as { settings: Settings };
      setS(data.settings);
      setSaved("Pengaturan disimpan.");
      setTimeout(() => setSaved(""), 2000);
    }
    setBusy(false);
  }

  function parseSequence(text: string): SequenceStep[] {
    return text
      .split(/\n\s*\n/)
      .map((block) => block.trim())
      .filter(Boolean)
      .map((block, i) => {
        const match = block.match(/^\[(\d+)\]\s*([\s\S]*)$/);
        if (!match) return null;
        return {
          id: `step-${i + 1}`,
          delayDays: Number(match[1]) || 0,
          template: match[2].trim(),
        };
      })
      .filter((x): x is SequenceStep => x !== null);
  }

  if (error) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
        <button className="btn-primary mt-4" onClick={() => window.location.reload()}>
          Muat ulang
        </button>
      </div>
    );
  }

  if (!s) return <p className="text-zinc-500">Memuat...</p>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Settings</h1>
          <p className="text-sm text-zinc-500">
            Profil bisnis, template pesan, dan konfigurasi AI.
          </p>
        </div>
        <button className="btn-primary" onClick={save} disabled={busy}>
          Simpan
        </button>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-700 rounded-lg px-4 py-2 text-sm">
          {saved}
        </div>
      )}

      <div className="card p-5 space-y-3">
        <h2 className="font-semibold text-zinc-900">Profil Bisnis</h2>
        <div>
          <label className="label">Nama bisnis / brand</label>
          <input
            className="input"
            value={s.businessName}
            onChange={(e) => setS({ ...s, businessName: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Layanan (satu per baris)</label>
          <textarea
            className="input"
            rows={4}
            value={servicesText}
            onChange={(e) => setServicesText(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Fokus segmen (opsional, untuk personalisasi)</label>
          <input
            className="input"
            value={s.segmentFocus}
            onChange={(e) => setS({ ...s, segmentFocus: e.target.value })}
            placeholder="cth: klinik, restoran, toko online"
          />
        </div>
        <div>
          <label className="label">Target outreach per minggu</label>
          <input
            className="input"
            type="number"
            value={s.weeklyTarget}
            onChange={(e) => setS({ ...s, weeklyTarget: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="card p-5 space-y-3">
        <h2 className="font-semibold text-zinc-900">AI Message Generator</h2>
        <p className="text-xs text-zinc-500">
          Tanpa API key, sistem memakai template fallback (berfungsi penuh).
          Aktifkan DeepSeek untuk pesan yang lebih personal otomatis.
        </p>
        <div>
          <label className="label">Provider</label>
          <select
            className="input"
            value={s.provider}
            onChange={(e) => setS({ ...s, provider: e.target.value })}
          >
            <option value="none">None (pakai template fallback)</option>
            <option value="deepseek">DeepSeek</option>
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">API Key DeepSeek</label>
            <input
              className="input"
              type="password"
              value={s.apiKey}
              onChange={(e) => setS({ ...s, apiKey: e.target.value })}
              placeholder="sk-..."
            />
          </div>
          <div>
            <label className="label">Base URL</label>
            <input
              className="input"
              value={s.baseUrl}
              onChange={(e) => setS({ ...s, baseUrl: e.target.value })}
              placeholder="https://api.deepseek.com/v1"
            />
          </div>
        </div>
        <div>
          <label className="label">Model</label>
          <input
            className="input"
            value={s.model}
            onChange={(e) => setS({ ...s, model: e.target.value })}
            placeholder="deepseek-chat"
          />
        </div>
      </div>

      <div className="card p-5 space-y-3">
        <h2 className="font-semibold text-zinc-900">
          Sequence Follow-up
        </h2>
        <p className="text-xs text-zinc-500">
          Format per blok (dipisah baris kosong):{" "}
          <code>[delayDalamHari] template pesan</code>. Placeholder yang
          tersedia: <code>{"{name}"}</code>, <code>{"{company}"}</code>,{" "}
          <code>{"{segment}"}</code>, <code>{"{business}"}</code>,{" "}
          <code>{"{services}"}</code>.
        </p>
        <textarea
          className="input font-mono"
          rows={12}
          value={seqText}
          onChange={(e) => setSeqText(e.target.value)}
        />
      </div>
    </div>
  );
}