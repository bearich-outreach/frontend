"use client";

import { useState } from "react";
import { Note } from "@/lib/types";

export function NoteForm({
  initial,
  onSubmit,
  submitLabel = "Simpan",
  busy = false,
}: {
  initial?: Note;
  onSubmit: (data: {
    title: string;
    content: string;
    tags: string[];
    pinned: boolean;
  }) => Promise<void>;
  submitLabel?: string;
  busy?: boolean;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [tagsText, setTagsText] = useState((initial?.tags ?? []).join(", "));
  const [pinned, setPinned] = useState(initial?.pinned ?? false);
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
      content,
      tags: tagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      pinned,
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
          placeholder="Judul catatan"
          required
        />
      </div>

      <div>
        <label className="label">Isi catatan</label>
        <textarea
          className="input min-h-64 font-mono text-sm"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Tulis catatan di sini..."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Tag (pisahkan dengan koma)</label>
          <input
            className="input"
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            placeholder="cth: ide, kerjaan, belanja"
          />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
              className="size-4 accent-brand-600"
            />
            Sematkan (pin)
          </label>
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