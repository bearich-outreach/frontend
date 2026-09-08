"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { TaskForm } from "@/components/task-form";
import { Modal } from "@/components/modal";
import { fmtDate } from "@/lib/format";
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS, Task } from "@/lib/types";
import { TASKS_API, apiFetch } from "@/lib/api";

const STATUS_STYLE: Record<Task["status"], string> = {
  done: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  in_progress: "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300",
  todo: "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

const PRIORITY_STYLE: Record<Task["priority"], string> = {
  high: "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
  low: "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  medium: "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
};

export default function TasksListPage() {
  const [rows, setRows] = useState<Task[]>([]);
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [doneOpen, setDoneOpen] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [overDone, setOverDone] = useState(false);
  const [isTouch] = useState(
    () => typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches
  );

  const filterActive = Boolean(status || priority || dueDate);
  // Drag hanya bila tanpa filter (mencegah korupsi urutan) & bukan layar sentuh.
  const canDrag = !filterActive && !isTouch;

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (priority) params.set("priority", priority);
      if (dueDate) params.set("dueDate", dueDate);
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
  }, [status, priority, dueDate]);

  useEffect(() => {
    load();
  }, [load]);

  const active = rows.filter((t) => t.status !== "done");
  const done = rows.filter((t) => t.status === "done");
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

  function onDragStart(t: Task) {
    setDragId(t.id);
  }

  function onDragEnd() {
    setDragId(null);
    setOverId(null);
    setOverDone(false);
  }

  async function dropOnActive(target: Task) {
    if (!dragId || dragId === target.id) return;
    const from = active.findIndex((t) => t.id === dragId);
    const to = active.findIndex((t) => t.id === target.id);
    if (from < 0 || to < 0) return;
    const next = [...active];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    const prev = rows;
    // Optimistis: tampilkan dulu, rollback bila gagal.
    setRows([...next, ...done]);
    setDragId(null);
    setOverId(null);
    const res = await apiFetch(`${TASKS_API}/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: next.map((t) => t.id) }),
    });
    if (!res.ok) {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      alert(d.error || "Gagal menyimpan urutan.");
      setRows(prev);
    }
  }

  async function dropOnDoneZone() {
    if (!dragId) return;
    const t = active.find((x) => x.id === dragId);
    setDragId(null);
    setOverDone(false);
    if (!t) return;
    await toggleDone(t);
  }

  function card(t: Task, doneRow: boolean) {
    return (
      <div
        key={t.id}
        draggable={canDrag && !doneRow}
        onDragStart={() => onDragStart(t)}
        onDragEnd={onDragEnd}
        onDragOver={doneRow ? undefined : (e) => { e.preventDefault(); setOverId(t.id); }}
        onDrop={doneRow ? undefined : (e) => { e.preventDefault(); dropOnActive(t); }}
        onClick={() => setEditingId(t.id)}
        className={`card p-3 w-60 sm:w-64 shrink-0 snap-start cursor-pointer flex flex-col gap-2 transition-shadow ${
          doneRow ? "opacity-70" : ""
        } ${dragId === t.id ? "opacity-40" : ""} ${
          overId === t.id && dragId ? "ring-2 ring-brand-500" : ""
        } ${canDrag && !doneRow ? "cursor-grab active:cursor-grabbing" : ""}`}
      >
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLE[t.status]}`}>{TASK_STATUS_LABELS[t.status]}</span>
          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${PRIORITY_STYLE[t.priority]}`}>{TASK_PRIORITY_LABELS[t.priority]}</span>
        </div>
        <div className={`text-sm font-medium break-words ${t.status === "done" ? "line-through text-zinc-400" : "text-zinc-800 dark:text-zinc-100"}`}>{t.title}</div>
        {t.description && <div className="text-xs text-zinc-500 line-clamp-2 break-words">{t.description}</div>}
        <div className="text-[11px] text-zinc-400 mt-auto">tenggat {fmtDate(t.dueDate)}</div>
        <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
          {!doneRow && (
            <button className="btn-secondary !py-1 text-[11px] flex-1" onClick={() => toggleDone(t)}>✓</button>
          )}
          {doneRow && (
            <button className="btn-secondary !py-1 text-[11px] flex-1" onClick={() => toggleDone(t)}>Buka lagi</button>
          )}
          <button className="btn-danger !py-1 text-[11px] flex-1" onClick={() => remove(t)}>Hapus</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50">Tugas</h1>
          <p className="text-sm text-zinc-500">{active.length} aktif · {done.length} selesai.</p>
        </div>
        <Link href="/apps/tasks/new" className="btn-primary shrink-0 text-sm">+ Tugas Baru</Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <input
          type="date"
          className="input"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Semua status</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Selesai</option>
        </select>
        <select className="input" value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="">Semua prioritas</option>
          <option value="low">Rendah</option>
          <option value="medium">Sedang</option>
          <option value="high">Tinggi</option>
        </select>
        {(dueDate || status || priority) && (
          <button
            className="btn-secondary w-full"
            onClick={() => {
              setDueDate("");
              setStatus("");
              setPriority("");
            }}
          >
            Reset
          </button>
        )}
      </div>

      {filterActive && (
        <p className="text-xs text-amber-600">Filter aktif — nonaktifkan filter untuk menyusun kartu via drag.</p>
      )}

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
          <>
            <div>
              <h2 className="text-sm font-semibold text-zinc-600 dark:text-zinc-300 mb-2">Aktif ({active.length})</h2>
              {active.length === 0 ? (
                <div className="card p-8 text-center text-zinc-400 text-sm">Tidak ada tugas aktif.</div>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                  {active.map((t) => card(t, false))}
                </div>
              )}
            </div>

            <div
              onDragOver={canDrag ? (e) => { e.preventDefault(); setOverDone(true); } : undefined}
              onDragLeave={() => setOverDone(false)}
              onDrop={canDrag ? (e) => { e.preventDefault(); dropOnDoneZone(); } : undefined}
              className={`rounded-xl transition-colors ${overDone ? "ring-2 ring-emerald-500" : ""}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">Selesai ({done.length})</h2>
                {done.length > 10 && (
                  <button className="btn-secondary !py-1 text-xs" onClick={() => setDoneOpen(!doneOpen)}>
                    {doneOpen ? "Tutup" : `Tampilkan semua (${done.length})`}
                  </button>
                )}
              </div>
              {done.length === 0 ? (
                <div className="card p-8 text-center text-zinc-400 text-sm">Belum ada yang selesai. {canDrag ? "Tarik kartu ke sini untuk menyelesaikan." : ""}</div>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                  {(doneOpen ? done : done.slice(0, 10)).map((t) => card(t, true))}
                </div>
              )}
            </div>
          </>
        )
      )}

      {editing && (
        <Modal title="Edit Tugas" onClose={() => setEditingId(null)}>
          <TaskForm initial={editing} onSubmit={submitEdit} submitLabel="Simpan Perubahan" busy={busy} />
        </Modal>
      )}
    </div>
  );
}
