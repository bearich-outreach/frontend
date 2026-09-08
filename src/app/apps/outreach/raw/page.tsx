"use client";
import { useEffect, useState } from "react";
import { OUTREACH_API, apiGet } from "@/lib/api";
import { RawLead } from "@/lib/types";
import { Pagination } from "@/components/pagination";

export default function RawPage() {
  const [leads, setLeads] = useState<RawLead[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  useEffect(() => {
    apiGet<{ rawLeads: RawLead[]; page: number; pageSize: number; total: number }>(`${OUTREACH_API}/raw-leads?page=${page}`)
      .then(d => { setLeads(d.rawLeads); setTotal(d.total); })
      .catch(() => {});
  }, [page]);
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Raw Leads ({total})</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-xs text-zinc-500 border-b"><th className="px-3 py-2 text-left">Nama Tempat</th><th className="px-3 py-2 text-left">Alamat / Maps</th><th className="px-3 py-2 text-left">Kota</th><th className="px-3 py-2 text-left">Rating</th><th className="px-3 py-2 text-left">Phone</th></tr></thead>
          <tbody>
            {leads.map(l => (
              <tr key={l.id} className="border-b"><td className="px-3 py-2">{l.name}</td><td className="px-3 py-2 text-xs">{l.address || "-"} {l.placeId && <a href={`https://www.google.com/maps/search/?api=1&query_place_id=${encodeURIComponent(l.placeId)}`} target="_blank" rel="noreferrer" className="text-sky-600 hover:underline ml-1">Maps</a>}</td><td className="px-3 py-2">{l.city}</td><td className="px-3 py-2">{l.rating} ({l.reviewCount})</td><td className="px-3 py-2">{l.phoneRaw}</td></tr>
            ))}
            {leads.length === 0 && (
              <tr><td colSpan={5} className="px-3 py-8 text-center text-zinc-400">Belum ada raw leads.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination page={page} total={total} onChange={setPage} />
    </div>
  );
}
