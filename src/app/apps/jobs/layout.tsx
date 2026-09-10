"use client";

import { AppSkeletonShell } from "@/components/app-skeleton-shell";

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppSkeletonShell
      slug="jobs"
      appName="Job Hunter"
      nav={[
        { href: "/apps/jobs", label: "Dashboard" },
        { href: "/apps/jobs/listings", label: "Lowongan" },
        { href: "/apps/jobs/targets", label: "Targets" },
        { href: "/apps/jobs/raw", label: "Raw" },
      ]}
    >
      {children}
    </AppSkeletonShell>
  );
}
