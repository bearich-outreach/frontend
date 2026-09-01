"use client";

import { AppSkeletonShell } from "@/components/app-skeleton-shell";

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppSkeletonShell
      slug="tasks"
      appName="Task Management"
      nav={[
        { href: "/apps/tasks", label: "Dashboard" },
        { href: "/apps/tasks/list", label: "Tugas" },
        { href: "/apps/tasks/new", label: "+ Tugas Baru" },
      ]}
    >
      {children}
    </AppSkeletonShell>
  );
}
