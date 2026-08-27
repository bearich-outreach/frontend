"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/bits";
import { fmtDate } from "@/lib/format";
import { Prospect, Settings } from "@/lib/types";
import { API_URL, apiGet } from "@/lib/api";

export default function ProspectsPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [seqLen, setSeqLen] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiGet<{ prospects: Prospect[] }>("/api/prospects"),
      apiGet<{ settings: Settings }>("/api/settings"),
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Prospects
          </h1>
          <p className="text-sm text-zinc-500">
            {prospects.length} prospek dalam pipeline.
          </p>
        </div>
        <div className="flex gap-2">
          <a href={`${API_URL}/api/prospects/export`} className="btn-secondary">
            Export CSV
          </a>
          <Link href="/prospects/new" className="btn-primary">
            + Tambah
          </Link>
        </div>
      </div>

      <div className="card overflow-x-auto">
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
                    href={`/prospects/${p.id}`}
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
                  <Link href="/prospects/new" className="text-brand-600 underline">
                    tambah prospek
                  </Link>
                  .
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}