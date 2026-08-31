"use client";

import { AppSkeletonShell } from "@/components/app-skeleton-shell";

export default function NotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppSkeletonShell
      slug="notes"
      appName="Notes"
      nav={[
        { href: "/apps/notes", label: "Catatan" },
        { href: "/apps/notes/new", label: "+ Catatan Baru" },
      ]}
    >
      {children}
    </AppSkeletonShell>
  );
}