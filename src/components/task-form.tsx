"use client";

import { useState } from "react";
import { Task, TaskPriority, TaskStatus } from "@/lib/types";

export function TaskForm({
  initial,
  onSubmit,
  submitLabel = "Simpan",
  busy = false,
}: {
  initial?: Task;
  onSubmit: (data: {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: string;
  }) => Promise<void>;
  submitLabel?: string;
  busy?: boolean;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [priority, setPriority] = useState<TaskPriority>(initial?.priority ?? "medium");
  const [status, setStatus] = useState<TaskStatus>(initial?.status ?? "todo");
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? "");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Judul wajib diisi.");
      return;
    }
    setError("");
    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      dueDate,
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label">Judul *</label>
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Judul tugas"
          required
        />
      </div>

      <div>
        <label className="label">Deskripsi</label>
        <textarea
          className="input min-h-24"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detail tugas..."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="label">Status</label>
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Selesai</option>
          </select>
        </div>
        <div>
          <label className="label">Prioritas</label>
          <select className="input" value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
            <option value="low">Rendah</option>
            <option value="medium">Sedang</option>
            <option value="high">Tinggi</option>
          </select>
        </div>
        <div>
          <label className="label">Tenggat</label>
          <input
            className="input"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button className="btn-primary" disabled={busy}>
        {busy ? "Menyimpan..." : submitLabel}
      </button>
    </form>
  );
}
