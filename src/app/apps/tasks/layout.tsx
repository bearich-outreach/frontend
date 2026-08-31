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
      nav={[{ href: "/apps/tasks", label: "Dashboard" }]}
    >
      {children}
    </AppSkeletonShell>
  );
}