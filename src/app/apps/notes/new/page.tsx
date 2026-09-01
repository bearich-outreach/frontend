"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { NoteForm } from "@/components/note-form";
import { NOTES_API, apiFetch } from "@/lib/api";

export default function NewNotePage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function submit(data: {
    title: string;
    content: string;
    tags: string[];
    pinned: boolean;
  }) {
    setBusy(true);
    const res = await apiFetch(`${NOTES_API}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setBusy(false);
    if (res.ok) {
      const d = (await res.json()) as { note: { id: string } };
      router.push(`/apps/notes/${d.note.id}`);
    } else {
      alert("Gagal menyimpan catatan.");
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50">Catatan Baru</h1>
        <p className="text-sm text-zinc-500">Tulis ide, catatan, atau dokumentasi.</p>
      </div>

      <div className="card p-4 sm:p-6">
        <NoteForm onSubmit={submit} submitLabel="Simpan Catatan" busy={busy} />
      </div>
    </div>
  );
}