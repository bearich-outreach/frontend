"use client";

import { useAppAuth } from "@/components/app-auth-gate";

export function AppSkeletonPage({
  title,
  description,
  sections,
}: {
  title: string;
  description: string;
  sections: { label: string; hint: string }[];
}) {
  const { app } = useAppAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          {title}
        </h1>
        <p className="text-sm text-zinc-500">{description}</p>
      </div>

      <div className="card p-8 text-center text-zinc-400">
        <p className="text-sm">
          Modul{" "}
          <span className="font-semibold text-zinc-600 dark:text-zinc-300">
            {app?.name}
          </span>{" "}
          sedang disiapkan. Fitur akan diisi pada pengembangan berikutnya.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((s) => (
          <div key={s.label} className="card p-5">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
              {s.label}
            </h3>
            <p className="mt-1 text-sm text-zinc-500">{s.hint}</p>
          </div>
        ))}
      </div>
    </div>
  );
}