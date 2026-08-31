"use client";

import Link from "next/link";
import { createContext, useContext, useEffect, useState } from "react";
import { App } from "@/lib/types";
import { fetchApps, platformMe, redirectToLogin } from "@/lib/api";

const AppAuthContext = createContext<{ app: App | null }>({ app: null });

export function useAppAuth() {
  return useContext(AppAuthContext);
}

export function AppAuthGate({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const [app, setApp] = useState<App | null>(null);
  const [platformOk, setPlatformOk] = useState<boolean | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const pOk = await platformMe();
      if (!pOk) {
        redirectToLogin();
        return;
      }
      if (cancelled) return;
      setPlatformOk(true);

      const apps = await fetchApps().catch(() => [] as App[]);
      if (cancelled) return;

      const found = apps.find((x) => x.slug === slug) ?? null;
      if (!found) setError("Aplikasi tidak ditemukan.");
      setApp(found);
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (platformOk !== true) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <span className="inline-flex items-center justify-center size-10 rounded-xl bg-brand-500 text-brand-950 font-bold text-lg animate-pulse">
            B
          </span>
          <p className="text-xs text-zinc-400 font-medium">Memuat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="card p-8 text-center text-zinc-500">
          {error}{" "}
          <Link href="/" className="text-brand-600 underline">
            Kembali ke daftar aplikasi
          </Link>
          .
        </div>
      </div>
    );
  }

  return <AppAuthContext.Provider value={{ app }}>{children}</AppAuthContext.Provider>;
}