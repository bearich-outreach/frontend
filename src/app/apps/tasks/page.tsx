"use client";

import { AppSkeletonPage } from "@/components/app-skeleton-page";

export default function TasksPage() {
  return (
    <AppSkeletonPage
      title="Task Management"
      description="Kelola tugas harian dan prioritas pekerjaan Anda."
      sections={[
        {
          label: "Daftar Tugas",
          hint: "Kumpulan tugas dengan status, prioritas, dan tenggat.",
        },
        {
          label: "Prioritas & Deadline",
          hint: "Urutkan pengerjaan berdasarkan tingkat kepentingan dan waktu.",
        },
        {
          label: "Statistik Harian",
          hint: "Pantau progres dan produktivitas harian.",
        },
      ]}
    />
  );
}