"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { logoutPlatform, platformMe, redirectToLogin } from "@/lib/api";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    platformMe()
      .then((ok) => {
        setAuthenticated(ok);
        if (!ok) redirectToLogin();
      })
      .catch(() => redirectToLogin());
  }, []);

  async function logout() {
    setBusy(true);
    await logoutPlatform();
    router.replace("/login");
    router.refresh();
  }

  if (authenticated !== true) {
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

  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-40 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center size-8 rounded-lg bg-brand-500 text-brand-950 font-bold">
              B
            </span>
            <span className="text-base font-semibold text-zinc-900 dark:text-white">
              Bearich Hub
            </span>
            <span className="hidden sm:inline-flex text-xs font-medium text-zinc-400 border border-zinc-200 dark:border-zinc-700 rounded-full px-2 py-0.5">
              Hub
            </span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle compact />
            <button
              onClick={logout}
              disabled={busy}
              className="btn-secondary !py-1.5"
            >
              {busy ? "Keluar..." : "Keluar"}
            </button>
          </div>
        </div>
      </header>
      <main className="p-4 md:p-6 max-w-6xl mx-auto w-full">{children}</main>
    </div>
  );
}