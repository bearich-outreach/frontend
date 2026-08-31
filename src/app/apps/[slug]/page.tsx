"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AppAuthGate, useAppAuth } from "@/components/app-auth-gate";

function AppPlaceholder() {
  const { app } = useAppAuth();
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center size-9 rounded-lg bg-brand-500 text-brand-950 font-bold">
            {app?.name.charAt(0).toUpperCase() ?? "?"}
          </span>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {app?.name}
            </h1>
            {app?.description && (
              <p className="text-sm text-zinc-500">{app.description}</p>
            )}
          </div>
        </div>
        <Link href="/" className="btn-secondary">
          ← Platform
        </Link>
      </div>

      <div className="card p-8 text-center text-zinc-400">
        <p className="text-sm">
          Modul{" "}
          <span className="font-semibold text-zinc-600 dark:text-zinc-300">
            {app?.name}
          </span>{" "}
          sedang disiapkan. Konten aplikasi akan diisi pada fase berikutnya.
        </p>
      </div>
    </div>
  );
}

export default function AppShellPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";

  return (
    <AppAuthGate slug={slug}>
      <AppPlaceholder />
    </AppAuthGate>
  );
}