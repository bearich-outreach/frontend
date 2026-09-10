"use client";
import { useEffect, useState } from "react";
import { JOBS_API, apiFetch } from "@/lib/api";
import { JobListing } from "@/lib/types";
import { Pagination } from "@/components/pagination";

export default function JobsListingsPage() {
  const [listings, setListings] = useState<JobListing[]>([]);
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");
  const [trash, setTrash] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState("");

  async function load(p: number, st: string, src: string, tr: boolean) {
    const params = new URLSearchParams();
    if (st) params.set("status", st);
    if (src) params.set("source", src);
    if (tr) params.set("hidden", "trash");
    params.set("page", String(p));
    const d = await apiFetch(`${JOBS_API}/listings?${params}`).then((r) => r.json()) as { listings: JobListing[]; total: number };
    setListings(d.listings);
    setTotal(d.total);
  }
  useEffect(() => { load(page, status, source, trash); }, [page, status, source, trash]);

  async function act(id: string, path: string, body?: unknown) {
    setBusy(id + path);
    await apiFetch(`${JOBS_API}/listings/${id}${path}`, body ? { method: "POST", body: JSON.stringify(body) } : { method: "POST" });
    await load(page, status, source, trash);
    setBusy("");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h1 className="text-xl font-bold">Lowongan ({total})</h1>
        <div className="flex flex-wrap gap-2">
          <select className="input w-auto !py-1.5 text-sm" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">Semua status</option>
            <option value="New">New</option>
            <option value="Saved">Saved</option>
            <option value="Applied">Applied</option>
            <option value="Interview">Interview</option>
            <option value="Rejected">Rejected</option>
          </select>
          <select className="input w-auto !py-1.5 text-sm" value={source} onChange={(e) => { setSource(e.target.value); setPage(1); }}>
            <option value="">Glints+JobStreet</option>
            <option value="glints">Glints</option>
            <option value="jobstreet">JobStreet</option>
          </select>
          <button className={trash ? "btn-primary text-sm" : "btn-secondary text-sm"} onClick={() => { setTrash(!trash); setPage(1); }}>
            {trash ? "Lihat Utama" : "Lihat Sampah"}
          </button>
        </div>
      </div>
      <div className="text-sm text-zinc-500">Sort skor + terbaru. Hanya terverifikasi Remote yang masuk — non-remote otomatis ditolak & tercatat di Raw.</div>
      <div className="space-y-2">
        {listings.map((l) => (
          <div key={l.id} className="card p-4 space-y-2">
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <div className="font-semibold">{l.title} <span className="text-xs text-zinc-400">· {l.company}</span></div>
                <div className="text-xs text-zinc-500">{l.source} · {l.location || "lokasi tak diketahui"} · Skor {l.score} · {l.status} · {l.postedDate ? new Date(l.postedDate).toLocaleDateString("id-ID") : "tanggal tak diketahui"}</div>
              </div>
              <span className={l.remoteLabel === "Remote" ? "text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-700" : "text-xs px-2 py-1 rounded bg-amber-100 text-amber-700"}>
                {l.remoteLabel}{l.reviewFlag ? " — cek detail" : ""}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <a className="btn-primary text-sm" href={l.url} target="_blank" rel="noreferrer">Check</a>
              {!trash ? (
                <>
                  <button className="btn-secondary text-sm" disabled={busy !== ""} onClick={() => act(l.id, "/status", { status: "Saved" })}>Saved</button>
                  <button className="btn-secondary text-sm" disabled={busy !== ""} onClick={() => act(l.id, "/status", { status: "Applied" })}>Applied</button>
                  <button className="btn-secondary text-sm !text-rose-600" disabled={busy !== ""} onClick={() => { if (confirm("Hapus ke Sampah? (bukan fully remote)")) act(l.id, "/hide"); }}>Hapus</button>
                </>
              ) : (
                <>
                  <button className="btn-secondary text-sm" disabled={busy !== ""} onClick={() => act(l.id, "/restore")}>Kembalikan</button>
                  <button className="btn-secondary text-sm !text-rose-600" disabled={busy !== ""} onClick={() => { if (confirm("Hapus permanen?")) { setBusy(l.id); apiFetch(`${JOBS_API}/listings/${l.id}`, { method: "DELETE" }).then(() => load(page, status, source, trash)).finally(() => setBusy("")); } }}>Hapus Permanen</button>
                </>
              )}
            </div>
          </div>
        ))}
        {listings.length === 0 && <div className="card p-8 text-center text-sm text-zinc-400">Belum ada data. Seed + Scrape Next di halaman Targets.</div>}
      </div>
      <Pagination page={page} total={total} onChange={setPage} />
    </div>
  );
}
