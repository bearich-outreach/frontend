"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { QualifiedLead } from "@/lib/types";
import { OUTREACH_API, apiGet } from "@/lib/api";
import { ProspectClient } from "./prospect-client";

export default function LeadDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const [lead, setLead] = useState<QualifiedLead | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    apiGet<{ lead: QualifiedLead }>(`${OUTREACH_API}/leads/${id}`)
      .then((d) => setLead(d.lead))
      .catch(() => setMissing(true));
  }, [id]);

  if (missing) {
    return (
      <div className="card p-10 text-center text-zinc-500">
        Lead tidak ditemukan. <Link href="/apps/outreach/prospects" className="text-brand-600 underline">Kembali</Link>.
      </div>
    );
  }

  if (!lead) {
    return <div className="h-64 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />;
  }

  return <ProspectClient lead={lead} />;
}
