"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { QualifiedLead } from "@/lib/types";
import { OUTREACH_API, apiFetch, apiGet } from "@/lib/api";
import { Pagination } from "@/components/pagination";

export default function OutreachProspectsPage() {
  const [leads, setLeads] = useState<QualifiedLead[]>([]);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState("");

  function load(p: number, status: string) {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    params.set("page", String(p));
    apiGet<{ leads: QualifiedLead[]; page: number; pageSize: number; total: number }>(`${OUTREACH_API}/leads?${params}`)
      .then((d) => { setLeads(d.leads); setTotal(d.total); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    load(page, filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, page]);

  async function sendWA(l: QualifiedLead) {
    if (!confirm(`Kirim WA ke ${l.name} (${l.phone628})?`)) return;
    setSendingId(l.id);
    try {
      const res = await apiFetch(`${OUTREACH_API}/leads/${l.id}/send`, {
        method: "POST",
        body: JSON.stringify({ message: l.message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert((data as { error?: string }).error || "Gagal kirim WA");
      } else if (filter === "New Lead" || filter === "") {
        // Lead keluar dari daftar New Lead -> muat ulang halaman aktif
        load(page, filter);
      } else {
        setLeads((prev) => prev.map((x) => (x.id === l.id ? { ...x, status: "Contacted" as const } : x)));
      }
    } catch {
      alert("Gagal kirim WA");
    }
    setSendingId("");
  }

  if (loading) return <div className="h-64 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold dark:text-zinc-50">Leads ({total})</h1>
          <p className="text-sm text-zinc-500">Skor ≥70 · WA aktif terverifikasi · kirim manual via tombol</p>
        </div>
        <select className="input w-auto" value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }}>
          <option value="">Semua status</option>
          <option value="New Lead">New Lead</option>
          <option value="Contacted">Contacted</option>
          <option value="Replied">Replied</option>
        </select>
      </div>

      <div className="hidden md:block card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-zinc-500 border-b">
              <th className="px-4 py-3">Nama Tempat</th>
              <th className="px-4 py-3">Alamat / Maps</th>
              <th className="px-4 py-3">Skor</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">WA</th>
              <th className="px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-b hover:bg-zinc-50 dark:hover:bg-zinc-800">
                <td className="px-4 py-3 font-medium"><Link href={`/apps/outreach/prospects/${l.id}`} className="hover:underline">{l.name}</Link><div className="text-xs font-normal text-zinc-500">{l.city} · {l.category}</div></td>
                <td className="px-4 py-3 text-xs text-zinc-600 max-w-xs">
                  {l.address && <div className="truncate" title={l.address}>{l.address}</div>}
                  {l.mapsUrl ? <a href={l.mapsUrl} target="_blank" rel="noreferrer" className="text-sky-600 hover:underline">Lihat di Maps</a> : <span className="text-zinc-400">-</span>}
                </td>
                <td className="px-4 py-3">{l.score}</td>
                <td className="px-4 py-3">{l.status}</td>
                <td className="px-4 py-3"><span className="inline-flex items-center gap-1">{l.phone628} <span className="text-xs text-emerald-600" title="WA aktif terverifikasi">✓ WA</span></span></td>
                <td className="px-4 py-3">
                  {l.status === "New Lead" ? (
                    <button className="btn-primary text-xs px-3 py-1.5" onClick={() => sendWA(l)} disabled={sendingId === l.id}>
                      {sendingId === l.id ? "Mengirim..." : "Kirim WA"}
                    </button>
                  ) : (
                    <span className="text-xs text-zinc-400">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {leads.map((l) => (
          <div key={l.id} className="card p-4">
            <Link href={`/apps/outreach/prospects/${l.id}`} className="font-medium hover:underline">{l.name}</Link>
            <div className="text-xs text-zinc-500">{l.city} · {l.category} · Skor {l.score} · {l.status}</div>
            {l.address && <div className="text-xs text-zinc-500 mt-1">{l.address}</div>}
            <div className="flex items-center gap-2 mt-2">
              {l.mapsUrl && <a href={l.mapsUrl} target="_blank" rel="noreferrer" className="text-xs text-sky-600 hover:underline">Lihat di Maps</a>}
              {l.status === "New Lead" && (
                <button className="btn-primary text-xs px-3 py-1.5 ml-auto" onClick={() => sendWA(l)} disabled={sendingId === l.id}>
                  {sendingId === l.id ? "Mengirim..." : "Kirim WA"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Pagination page={page} total={total} onChange={setPage} />
    </div>
  );
}
