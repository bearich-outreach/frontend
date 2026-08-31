"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { fmtDateTime } from "@/lib/format";
import { Note } from "@/lib/types";
import { NOTES_API, apiFetch } from "@/lib/api";

export default function NotesListPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (tag) params.set("tag", tag);
      const q = params.toString();
      const [n, t] = await Promise.all([
        apiFetch(`${NOTES_API}/notes${q ? `?${q}` : ""}`),
        apiFetch(`${NOTES_API}/tags`),
      ]);
      if (!n.ok) throw new Error(`Request failed: ${n.status}`);
      setNotes(((await n.json()) as { notes: Note[] }).notes);
      setTags(((await t.json()) as { tags: string[] }).tags);
      setLoading(false);
    } catch (e) {
      if (e instanceof Error && e.message !== "Unauthorized") {
        setError("Tidak dapat terhubung ke server API. Muat ulang untuk mencoba lagi.");
      }
      setLoading(false);
    }
  }, [search, tag]);

  useEffect(() => {
    load();
  }, [load]);

  function toggleTag(t: string) {
    setTag((prev) => (prev === t ? "" : t));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Catatan</h1>
          <p className="text-sm text-zinc-500">{notes.length} catatan.</p>
        </div>
        <Link href="/apps/notes/new" className="btn-primary">+ Catatan Baru</Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          className="input max-w-xs"
          placeholder="Cari catatan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <button
                key={t}
                onClick={() => toggleTag(t)}
                className={`text-xs rounded-full border px-2.5 py-0.5 font-medium transition-colors ${
                  tag === t
                    ? "border-brand-500 bg-brand-500 text-white"
                    : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                #{t}
              </button>
            ))}
          </div>
        )}
        {(search || tag) && (
          <button
            className="btn-secondary !py-1"
            onClick={() => {
              setSearch("");
              setTag("");
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-40 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : (
        !error &&
        (notes.length === 0 ? (
          <div className="card p-10 text-center text-zinc-400">
            Belum ada catatan.{" "}
            <Link href="/apps/notes/new" className="text-brand-600 underline">
              Buat catatan pertama
            </Link>
            .
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map((n) => (
              <Link
                key={n.id}
                href={`/apps/notes/${n.id}`}
                className="card p-5 group hover:border-brand-400 dark:hover:border-brand-500/50 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 truncate">
                    {n.pinned && <span className="text-amber-500 mr-1">📌</span>}
                    {n.title}
                  </h3>
                </div>
                {n.content && (
                  <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3 whitespace-pre-wrap">
                    {n.content}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {n.tags.map((t) => (
                    <span key={t} className="text-xs text-zinc-400">#{t}</span>
                  ))}
                </div>
                <div className="mt-2 text-xs text-zinc-400">
                  {fmtDateTime(n.updatedAt)}
                </div>
              </Link>
            ))}
          </div>
        ))
      )}
    </div>
  );
}