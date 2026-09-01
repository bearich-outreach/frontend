"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { TaskForm } from "@/components/task-form";
import { TaskPriority, TaskStatus } from "@/lib/types";
import { TASKS_API, apiFetch } from "@/lib/api";

export default function NewTaskPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function submit(data: {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: string;
  }) {
    setBusy(true);
    const res = await apiFetch(`${TASKS_API}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setBusy(false);
    if (res.ok) {
      router.push("/apps/tasks/list");
    } else {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      alert(d.error || "Gagal menyimpan tugas.");
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Tugas Baru</h1>
        <p className="text-sm text-zinc-500">Tambah tugas dengan prioritas dan tenggat.</p>
      </div>

      <div className="card p-6">
        <TaskForm onSubmit={submit} submitLabel="Simpan Tugas" busy={busy} />
      </div>
    </div>
  );
}
