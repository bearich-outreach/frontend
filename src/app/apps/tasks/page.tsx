"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { StatCard } from "@/components/bits";
import { fmtDate } from "@/lib/format";
import { Task, TaskStats } from "@/lib/types";
import { TASKS_API, apiFetch } from "@/lib/api";

export default function TasksDashboardPage() {
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [overdue, setOverdue] = useState<Task[]>([]);
  const [recent, setRecent] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const s = await apiFetch(`${TASKS_API}/stats`).then((r) => r.json());
      const all = await apiFetch(`${TASKS_API}/tasks`).then((r) => r.json());
      setStats((s as { stats: TaskStats }).stats);
      const tasks = (all as { tasks: Task[] }).tasks;
      const overdueList = tasks.filter((t) => {
        if (t.status === "done" || !t.dueDate) return false;
        return t.dueDate < new Date().toISOString().slice(0, 10);
      });
      setOverdue(overdueList.slice(0, 6));
      setRecent(tasks.slice(0, 8));
      setLoading(false);
    } catch (e) {
      if (e instanceof Error && e.message !== "Unauthorized") {
        setError("Tidak dapat terhubung ke server API.");
      }
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
        <button className="btn-primary mt-4" onClick={load}>Muat ulang</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Dashboard</h1>
          <p className="text-sm text-zinc-500">Ringkasan tugas harian.</p>
        </div>
        <Link href="/apps/tasks/list" className="btn-primary">Buka Daftar Tugas</Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total" value={stats?.total ?? 0} />
        <StatCard label="To Do" value={stats?.todo ?? 0} />
        <StatCard label="In Progress" value={stats?.inProgress ?? 0} />
        <StatCard label="Selesai" value={stats?.done ?? 0} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Terlambat" value={stats?.overdue ?? 0} sub="tugas lewat tenggat" />
        <StatCard label="Jatuh tempo hari ini" value={stats?.dueToday ?? 0} />
        <StatCard label="Selesai hari ini" value={stats?.doneToday ?? 0} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Perlu perhatian (terlambat)</h2>
          {overdue.length === 0 ? (
            <p className="text-sm text-zinc-500">Tidak ada tugas terlambat.</p>
          ) : (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {overdue.map((t) => (
                <li key={t.id} className="py-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{t.title}</span>
                  <span className="text-xs text-rose-600 dark:text-rose-400">tenggat {fmtDate(t.dueDate)} · {t.priority}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Tugas terbaru</h2>
          {recent.length === 0 ? (
            <p className="text-sm text-zinc-500">Belum ada tugas.</p>
          ) : (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {recent.map((t) => (
                <li key={t.id} className="py-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm text-zinc-800 dark:text-zinc-100">{t.title}</span>
                  <span className="text-xs text-zinc-400">{fmtDate(t.dueDate)} · {t.status}</span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/apps/tasks/list" className="btn-primary mt-3 inline-flex">Kelola Tugas</Link>
        </div>
      </div>
    </div>
  );
}
