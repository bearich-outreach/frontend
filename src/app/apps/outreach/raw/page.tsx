"use client";
import { useEffect, useState } from "react";
import { OUTREACH_API, apiGet } from "@/lib/api";
import { RawLead } from "@/lib/types";

export default function RawPage() {
  const [leads, setLeads] = useState<RawLead[]>([]);
  useEffect(() => { apiGet<{ rawLeads: RawLead[] }>(`${OUTREACH_API}/raw-leads`).then(d => setLeads(d.rawLeads)).catch(()=>{}); }, []);
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Raw Leads (dedup place_id)</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-xs text-zinc-500 border-b"><th className="px-3 py-2">Nama</th><th className="px-3 py-2">Kota</th><th className="px-3 py-2">Rating</th><th className="px-3 py-2">Phone</th></tr></thead>
          <tbody>
            {leads.map(l => (
              <tr key={l.id} className="border-b"><td className="px-3 py-2">{l.name}</td><td className="px-3 py-2">{l.city}</td><td className="px-3 py-2">{l.rating} ({l.reviewCount})</td><td className="px-3 py-2">{l.phoneRaw}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
