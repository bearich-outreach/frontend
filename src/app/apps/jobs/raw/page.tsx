"use client";
import { useEffect, useState } from "react";
import { JOBS_API, apiFetch } from "@/lib/api";
import { Pagination } from "@/components/pagination";

interface Raw { id: string; source: string; title: string; company: string; url: string; reasonSkipped?: string; lastSeenAt: string; }

export default function JobsRawPage() {
  const [rows, setRows] = useState<Raw[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  async function load(p: number) {
    const d = await apiFetch(`${JOBS_API}/raw?page=${p}`).then((r) => r.json()) as { raw: Raw[]; total: number };
    setRows(d.raw);
    setTotal(d.total);
  }
  useEffect(() => { load(page); }, [page]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Raw ({total})</h1>
      <div className="text-sm text-zinc-500">Mentah dedup source+external_id + URL. Semua tetap diteruskan ke Lowongan dengan label.</div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-xs text-zinc-500 border-b"><th className="px-3 py-2 text-left">Judul</th><th className="px-3 py-2 text-left">Perusahaan</th><th className="px-3 py-2 text-left">Sumber</th><th className="px-3 py-2 text-left">Aksi</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b"><td className="px-3 py-2">{r.title}</td><td className="px-3 py-2">{r.company}</td><td className="px-3 py-2">{r.source}</td><td className="px-3 py-2"><a className="btn-secondary text-xs" href={r.url} target="_blank" rel="noreferrer">Check</a></td></tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={4} className="px-3 py-8 text-center text-zinc-400">Belum ada raw.</td></tr>}
          </tbody>
        </table>
      </div>
      <Pagination page={page} total={total} onChange={setPage} />
    </div>
  );
}
