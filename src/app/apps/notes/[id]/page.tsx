"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { NoteForm } from "@/components/note-form";
import { fmtDateTime } from "@/lib/format";
import { Note } from "@/lib/types";
import { NOTES_API, apiFetch } from "@/lib/api";

export default function NoteDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id ?? "";
  const [note, setNote] = useState<Note | null>(null);
  const [editing, setEditing] = useState(false);
  const [missing, setMissing] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!id) return;
    apiFetch(`${NOTES_API}/notes/${id}`)
      .then(async (r) => {
        if (cancelled) return;
        if (r.status === 404) {
          setMissing(true);
          return;
        }
        if (!r.ok) throw new Error(`Request failed: ${r.status}`);
        const d = (await r.json()) as { note: Note };
        setNote(d.note);
      })
      .catch(() => {
        if (!cancelled) setMissing(true);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function save(data: {
    title: string;
    content: string;
    tags: string[];
    pinned: boolean;
  }) {
    setBusy(true);
    const res = await apiFetch(`${NOTES_API}/notes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setBusy(false);
    if (res.ok) {
      const d = (await res.json()) as { note: Note };
      setNote(d.note);
      setEditing(false);
    } else {
      alert("Gagal menyimpan catatan.");
    }
  }

  async function togglePin() {
    if (!note) return;
    const res = await apiFetch(`${NOTES_API}/notes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned: !note.pinned }),
    });
    if (res.ok) {
      const d = (await res.json()) as { note: Note };
      setNote(d.note);
    }
  }

  async function remove() {
    if (!confirm("Hapus catatan ini?")) return;
    await apiFetch(`${NOTES_API}/notes/${id}`, { method: "DELETE" });
    router.push("/apps/notes");
  }

  if (missing) {
    return (
      <div className="card p-10 text-center text-zinc-500">
        Catatan tidak ditemukan.{" "}
        <Link href="/apps/notes" className="text-brand-600 underline">
          Kembali ke daftar
        </Link>
        .
      </div>
    );
  }

  if (!note) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        <div className="h-64 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {editing ? (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Edit Catatan</h1>
            <button className="btn-secondary !py-1" onClick={() => setEditing(false)}>Batal</button>
          </div>
          <NoteForm initial={note} onSubmit={save} submitLabel="Simpan Perubahan" busy={busy} />
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {note.pinned && <span className="text-amber-500 mr-1">📌</span>}
                {note.title}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
                <span>Diperbarui {fmtDateTime(note.updatedAt)}</span>
                {note.tags.map((t) => (
                  <span key={t} className="text-xs text-zinc-400">#{t}</span>
                ))}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button className="btn-secondary !py-1" onClick={togglePin} disabled={busy}>
                {note.pinned ? "Lepas pin" : "Pin"}
              </button>
              <button className="btn-secondary !py-1" onClick={() => setEditing(true)}>Edit</button>
              <button className="btn-danger !py-1" onClick={remove}>Hapus</button>
            </div>
          </div>

          <div className="card p-6">
            {note.content ? (
              <div className="whitespace-pre-wrap text-zinc-800 dark:text-zinc-100 leading-relaxed">
                {note.content}
              </div>
            ) : (
              <p className="text-sm text-zinc-400">Tidak ada isi catatan.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}