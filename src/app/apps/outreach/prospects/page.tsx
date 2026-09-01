"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/bits";
import { fmtDate } from "@/lib/format";
import { Prospect, Settings } from "@/lib/types";
import { API_URL, OUTREACH_API, apiGet } from "@/lib/api";

export default function OutreachProspectsPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [seqLen, setSeqLen] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiGet<{ prospects: Prospect[] }>(`${OUTREACH_API}/prospects`),
      apiGet<{ settings: Settings }>(`${OUTREACH_API}/settings`),
    ])
      .then(([p, s]) => {
        setProspects(p.prospects);
        setSeqLen(s.settings.sequence.length);
        setLoading(false);
      })
      .catch((e) => {
        if (e instanceof Error && e.message !== "Unauthorized") {
          setError("Tidak dapat terhubung ke server API. Pastikan backend berjalan, lalu muat ulang.");
        }
        setLoading(false);
      });
  }, []);

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

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        <div className="h-64 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Prospects
          </h1>
          <p className="text-sm text-zinc-500">
            {prospects.length} prospek dalam pipeline.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <a href={`${API_URL}${OUTREACH_API}/prospects/export`} className="btn-secondary text-xs sm:text-sm">
            Export CSV
          </a>
          <Link href="/apps/outreach/prospects/new" className="btn-primary text-xs sm:text-sm">
            + Tambah
          </Link>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Perusahaan</th>
              <th className="px-4 py-3">Kanal</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Step</th>
              <th className="px-4 py-3">Follow-up berikut</th>
            </tr>
          </thead>
          <tbody>
            {prospects.map((p) => (
              <tr
                key={p.id}
                className="border-b border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/40"
              >
                <td className="px-4 py-3 font-medium text-zinc-800 dark:text-zinc-100">
                  <Link
                    href={`/apps/outreach/prospects/${p.id}`}
                    className="hover:text-brand-600 hover:underline"
                  >
                    {p.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {p.company || "—"}
                </td>
                <td className="px-4 py-3 capitalize text-zinc-600 dark:text-zinc-400">
                  {p.channel}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {p.followUpStep}/{seqLen}
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {fmtDate(p.nextFollowUpAt)}
                </td>
              </tr>
            ))}
            {prospects.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-400">
                  Belum ada prospek. Mulai dari{" "}
                  <Link href="/apps/outreach/prospects/new" className="text-brand-600 underline">
                    tambah prospek
                  </Link>
                  .
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {prospects.map((p) => (
          <Link key={p.id} href={`/apps/outreach/prospects/${p.id}`} className="card p-4 block space-y-2 hover:border-brand-300">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-medium text-zinc-900 dark:text-zinc-100 truncate">{p.name}</div>
                <div className="text-xs text-zinc-500 truncate">{p.company || "—"} · <span className="capitalize">{p.channel}</span></div>
              </div>
              <StatusBadge status={p.status} />
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>Step {p.followUpStep}/{seqLen}</span>
              <span>{fmtDate(p.nextFollowUpAt)}</span>
            </div>
          </Link>
        ))}
        {prospects.length === 0 && (
          <div className="card p-8 text-center text-zinc-400 text-sm">
            Belum ada prospek. Mulai dari{" "}
            <Link href="/apps/outreach/prospects/new" className="text-brand-600 underline">
              tambah prospek
            </Link>
            .
          </div>
        )}
      </div>
    </div>
  );
}