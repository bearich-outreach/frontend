"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { QualifiedLead } from "@/lib/types";
import { OUTREACH_API, apiGet } from "@/lib/api";

export default function OutreachProspectsPage() {
  const [leads, setLeads] = useState<QualifiedLead[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<{ leads: QualifiedLead[] }>(`${OUTREACH_API}/leads${filter ? `?status=${encodeURIComponent(filter)}` : ""}`)
      .then((d) => { setLeads(d.leads); setLoading(false); })
      .catch(() => setLoading(false));
  }, [filter]);

  if (loading) return <div className="h-64 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold dark:text-zinc-50">Leads ({leads.length})</h1>
          <p className="text-sm text-zinc-500">Skor ≥70 · WA aktif terverifikasi · buffer &lt;10 auto-refill</p>
        </div>
        <select className="input w-auto" value={filter} onChange={(e) => setFilter(e.target.value)}>
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
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Kota / Kategori</th>
              <th className="px-4 py-3">Skor</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">WA</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-b hover:bg-zinc-50 dark:hover:bg-zinc-800">
                <td className="px-4 py-3 font-medium"><Link href={`/apps/outreach/prospects/${l.id}`} className="hover:underline">{l.name}</Link></td>
                <td className="px-4 py-3 text-zinc-600">{l.city} · {l.category}</td>
                <td className="px-4 py-3">{l.score}</td>
                <td className="px-4 py-3">{l.status}</td>
                <td className="px-4 py-3"><span className="inline-flex items-center gap-1">{l.phone628} <span className="text-xs text-emerald-600" title="WA aktif terverifikasi">✓ WA</span></span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {leads.map((l) => (
          <Link key={l.id} href={`/apps/outreach/prospects/${l.id}`} className="card p-4 block">
            <div className="font-medium">{l.name}</div>
            <div className="text-xs text-zinc-500">{l.city} · {l.category} · Skor {l.score} · {l.status}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
