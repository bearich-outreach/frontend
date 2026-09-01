"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { TaskForm } from "@/components/task-form";
import { fmtDate } from "@/lib/format";
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS, Task } from "@/lib/types";
import { TASKS_API, apiFetch } from "@/lib/api";

export default function TasksListPage() {
  const [rows, setRows] = useState<Task[]>([]);
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (priority) params.set("priority", priority);
      if (search) params.set("search", search);
      const q = params.toString();
      const res = await apiFetch(`${TASKS_API}/tasks${q ? `?${q}` : ""}`);
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = (await res.json()) as { tasks: Task[] };
      setRows(data.tasks);
      setLoading(false);
    } catch (e) {
      if (e instanceof Error && e.message !== "Unauthorized") {
        setError("Tidak dapat terhubung ke server API.");
      }
      setLoading(false);
    }
  }, [status, priority, search]);

  useEffect(() => {
    load();
  }, [load]);

  const editing = editingId ? rows.find((r) => r.id === editingId) ?? null : null;

  async function submitEdit(data: {
    title: string;
    description: string;
    status: Task["status"];
    priority: Task["priority"];
    dueDate: string;
  }) {
    if (!editing) return;
    setBusy(true);
    const res = await apiFetch(`${TASKS_API}/tasks/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setBusy(false);
    if (res.ok) {
      setEditingId(null);
      load();
    } else {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      alert(d.error || "Gagal menyimpan.");
    }
  }

  async function toggleDone(t: Task) {
    const next = t.status === "done" ? "todo" : "done";
    await apiFetch(`${TASKS_API}/tasks/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    load();
  }

  async function remove(t: Task) {
    if (!confirm(`Hapus tugas "${t.title}"?`)) return;
    await apiFetch(`${TASKS_API}/tasks/${t.id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Tugas</h1>
          <p className="text-sm text-zinc-500">{rows.length} tugas.</p>
        </div>
        <Link href="/apps/tasks/new" className="btn-primary">+ Tugas Baru</Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          className="input max-w-xs"
          placeholder="Cari tugas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input !w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Semua status</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Selesai</option>
        </select>
        <select className="input !w-auto" value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="">Semua prioritas</option>
          <option value="low">Rendah</option>
          <option value="medium">Sedang</option>
          <option value="high">Tinggi</option>
        </select>
        {(search || status || priority) && (
          <button
            className="btn-secondary"
            onClick={() => {
              setSearch("");
              setStatus("");
              setPriority("");
            }}
          >
            Reset
          </button>
        )}
      </div>

      {error && (
        <div className="card p-8 text-center">
          <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
          <button className="btn-primary mt-4" onClick={load}>Muat ulang</button>
        </div>
      )}

      {loading ? (
        <div className="h-64 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
      ) : (
        !error && (
          <div className="grid gap-3">
            {rows.map((t) => (
              <div key={t.id} className="card p-4 flex flex-wrap gap-3">
                <div className="flex-1 min-w-52">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                      t.status === "done"
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                        : t.status === "in_progress"
                        ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300"
                        : "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    }`}>{TASK_STATUS_LABELS[t.status]}</span>
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                      t.priority === "high"
                        ? "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
                        : t.priority === "low"
                        ? "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        : "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
                    }`}>{TASK_PRIORITY_LABELS[t.priority]}</span>
                  </div>
                  <div className={`mt-1 text-sm font-medium ${t.status === "done" ? "line-through text-zinc-400" : "text-zinc-800 dark:text-zinc-100"}`}>{t.title}</div>
                  {t.description && <div className="text-xs text-zinc-500 mt-1 line-clamp-2">{t.description}</div>}
                  <div className="text-xs text-zinc-400 mt-1">tenggat {fmtDate(t.dueDate)}</div>
                </div>
                <div className="flex flex-wrap items-center gap-2 self-start">
                  <button className="btn-secondary !py-1" onClick={() => toggleDone(t)}>
                    {t.status === "done" ? "Batalkan" : "Selesai"}
                  </button>
                  <button className="btn-secondary !py-1" onClick={() => setEditingId(editingId === t.id ? null : t.id)}>Edit</button>
                  <button className="btn-danger !py-1" onClick={() => remove(t)}>Hapus</button>
                </div>
              </div>
            ))}
            {rows.length === 0 && (
              <div className="card p-10 text-center text-zinc-400">Belum ada tugas.</div>
            )}
          </div>
        )
      )}

      {editing && (
        <div className="card p-6 max-w-2xl">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Edit Tugas</h2>
            <button className="btn-secondary !py-1" onClick={() => setEditingId(null)}>Batal</button>
          </div>
          <TaskForm initial={editing} onSubmit={submitEdit} submitLabel="Simpan Perubahan" busy={busy} />
        </div>
      )}
    </div>
  );
}
