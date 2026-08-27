"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Activity, Prospect, SequenceStep } from "@/lib/types";
import { apiGet } from "@/lib/api";
import { ProspectClient } from "./prospect-client";

export default function ProspectDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [sequence, setSequence] = useState<SequenceStep[]>([]);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    Promise.all([
      apiGet<{ prospect: Prospect }>(`/api/prospects/${id}`),
      apiGet<{ activities: Activity[] }>(`/api/prospects/${id}/activities`),
      apiGet<{ settings: { sequence: SequenceStep[] } }>("/api/settings"),
    ])
      .then(([p, a, s]) => {
        setProspect(p.prospect);
        setActivities(a.activities);
        setSequence(s.settings.sequence);
      })
      .catch((e) => {
        if (String((e as Error).message).includes("401") || (e as Error).message === "Unauthorized") {
          return;
        }
        setMissing(true);
      });
  }, [id]);

  if (missing) {
    return (
      <div className="card p-10 text-center text-zinc-500">
        Prospek tidak ditemukan.{" "}
        <Link href="/prospects" className="text-brand-600 underline">
          Kembali ke daftar
        </Link>
        .
      </div>
    );
  }

  if (!prospect) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        <div className="h-64 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
      </div>
    );
  }

  return (
    <ProspectClient
      prospect={prospect}
      activities={activities}
      sequence={sequence}
    />
  );
}