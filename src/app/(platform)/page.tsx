"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { App } from "@/lib/types";
import { fetchApps } from "@/lib/api";

export default function PlatformHomePage() {
  const [apps, setApps] = useState<App[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchApps()
      .then(setApps)
      .catch(() => setError("Tidak dapat memuat daftar aplikasi. Muat ulang untuk mencoba lagi."));
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

  if (!apps) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-40 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Aplikasi
        </h1>
        <p className="text-sm text-zinc-500">
          Pilih aplikasi untuk dibuka.
        </p>
      </div>

      {apps.length === 0 ? (
        <div className="card p-8 sm:p-10 text-center text-zinc-400">
          Belum ada aplikasi yang tersedia.
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {apps.map((a) => (
            <Link
              key={a.id}
              href={`/apps/${a.slug}`}
              className="card p-4 sm:p-5 group hover:border-brand-400 dark:hover:border-brand-500/50 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <span className="inline-flex items-center justify-center size-11 rounded-xl bg-brand-100 text-brand-700 font-bold text-lg dark:bg-brand-500/10 dark:text-brand-300">
                  {a.name.charAt(0).toUpperCase()}
                </span>
                <ArrowRightIcon className="size-4 text-zinc-300 group-hover:text-brand-500 dark:text-zinc-600 transition-colors" />
              </div>
              <h3 className="mt-4 font-semibold text-zinc-900 dark:text-zinc-50">
                {a.name}
              </h3>
              {a.description && (
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
                  {a.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}