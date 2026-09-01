"use client";
import { OUTREACH_API, apiFetch } from "@/lib/api";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Prospect, SequenceStep } from "@/lib/types";
import { StatusBadge } from "@/components/bits";
import { fmtDate } from "@/lib/format";

interface DueRow {
  prospect: Prospect;
  message: string;
  usedAI: boolean;
  loading: boolean;
}

export default function OutreachQueuePage() {
  const [rows, setRows] = useState<DueRow[]>([]);
  const [sequence, setSequence] = useState<SequenceStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [dueRes, seqRes] = await Promise.all([
        apiFetch(`${OUTREACH_API}/queue`).then((r) => r.json()),
        apiFetch(`${OUTREACH_API}/settings`).then((r) => r.json()),
      ]);
      const due = (dueRes as { due: Prospect[] }).due;
      const seq = (seqRes as { settings: { sequence: SequenceStep[] } }).settings
        .sequence;
      setSequence(seq);
      setRows(
        due.map((prospect) => ({
          prospect,
          message: "",
          usedAI: false,
          loading: false,
        }))
      );
    } catch (e) {
      setError(
        e instanceof Error && e.message === "Unauthorized"
          ? ""
          : "Tidak dapat terhubung ke server API. Pastikan backend berjalan, lalu coba lagi."
      );
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function generate(row: DueRow, index: number) {
    const updated = [...rows];
    updated[index] = { ...row, loading: true };
    setRows(updated);
    try {
      const res = await apiFetch(
        `${OUTREACH_API}/prospects/${row.prospect.id}/message`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) }
      );
      if (!res.ok) throw new Error("Gagal membuat pesan.");
      const data = (await res.json()) as { message: string; usedAI: boolean };
      updated[index] = { ...row, message: data.message, usedAI: data.usedAI, loading: false };
    } catch {
      alert("Gagal membuat pesan. Periksa koneksi backend.");
      updated[index] = { ...row, loading: false };
    }
    setRows(updated);
  }

  async function markSent(index: number) {
    const row = rows[index];
    try {
      const res = await apiFetch(`${OUTREACH_API}/prospects/${row.prospect.id}/advance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: row.message }),
      });
      if (!res.ok) throw new Error("Gagal menandai terkirim.");
      load();
    } catch {
      alert("Gagal memproses status terkirim.");
    }
  }

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
  }

  if (loading) return <p className="text-zinc-500">Memuat antrian...</p>;

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-zinc-900">Outreach Queue</h1>
        <div className="card p-8 text-center">
          <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
          <button className="btn-primary mt-4" onClick={load}>
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  const seqTotal = Math.max(1, sequence.length);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50">Outreach Queue</h1>
          <p className="text-sm text-zinc-500">
            {rows.length} prospek yang perlu dihubungi hari ini. Kerjakan satu per
            satu dengan konsisten — hasilnya pasti secara statistik.
          </p>
        </div>
        <button className="btn-secondary shrink-0 text-sm" onClick={load}>
          Refresh
        </button>
      </div>

      {rows.length === 0 && (
        <div className="card p-8 text-center text-zinc-400">
          Tidak ada yang perlu di-outreach sekarang. Tambah prospek baru atau
          tunggu jadwal follow-up berikutnya.
        </div>
      )}

      <div className="space-y-3 sm:space-y-4">
        {rows.map((row, i) => {
          const p = row.prospect;
          return (
            <div key={p.id} className="card p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                  <Link href={`/apps/outreach/prospects/${p.id}`} className="font-semibold text-zinc-900 dark:text-zinc-50 hover:underline break-words">
                    {p.name}
                  </Link>
                  {p.company && <span className="text-zinc-500 text-sm truncate">{p.company}</span>}
                  <StatusBadge status={p.status} />
                </div>
                <div className="text-xs text-zinc-400 shrink-0">
                  follow-up {Math.min(p.followUpStep, seqTotal - 1) + 1}/{seqTotal} · jatuh tempo{" "}
                  {fmtDate(p.nextFollowUpAt)}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <button className="btn-primary text-sm" onClick={() => generate(row, i)} disabled={row.loading}>
                  {row.loading ? "Membuat..." : row.message ? "Regenerate" : "Generate Pesan"}
                </button>
                {row.message && (
                  <>
                    <button className="btn-secondary text-sm" onClick={() => copy(row.message)}>
                      Copy
                    </button>
                    <button className="btn-secondary text-emerald-700 text-sm" onClick={() => markSent(i)}>
                      Tandai Terkirim
                    </button>
                  </>
                )}
              </div>

              {row.message ? (
                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-sm whitespace-pre-wrap break-words dark:bg-zinc-800/60 dark:border-zinc-700 dark:text-zinc-100">
                  {row.message}
                </div>
              ) : (
                <p className="text-xs text-zinc-400">
                  {row.usedAI ? "Dihasilkan AI." : "Klik generate untuk membuat pesan."}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}