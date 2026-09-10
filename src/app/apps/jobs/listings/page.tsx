"use client";
import { useEffect, useState } from "react";
import { JOBS_API, apiFetch, apiGet } from "@/lib/api";
import { JobListing } from "@/lib/types";
import { Pagination } from "@/components/pagination";

type Tab = "New" | "Saved" | "Applied" | "Interview" | "Rejected" | "Sampah";
const TABS: Tab[] = ["New", "Saved", "Applied", "Interview", "Rejected", "Sampah"];

interface Stats {
  listings: { total: number; byStatus: Record<string, number>; hidden: number };
}

const EMPTY_TEXT: Record<Tab, string> = {
  New: "Antrean kosong. Seed + Scrape Next di halaman Targets.",
  Saved: "Belum ada yang disimpan.",
  Applied: "Belum ada yang dilamar.",
  Interview: "Belum ada yang sampai interview.",
  Rejected: "Belum ada yang ditolak.",
  Sampah: "Sampah kosong.",
};

export default function JobsListingsPage() {
  const [listings, setListings] = useState<JobListing[]>([]);
  const [tab, setTab] = useState<Tab>("New");
  const [source, setSource] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState<{ byStatus: Record<string, number>; hidden: number }>({ byStatus: {}, hidden: 0 });
  const [busy, setBusy] = useState("");

  async function load(p: number, t: Tab, src: string) {
    const params = new URLSearchParams();
    if (t === "Sampah") params.set("hidden", "trash");
    else params.set("status", t);
    if (src) params.set("source", src);
    params.set("page", String(p));
    const d = await apiFetch(`${JOBS_API}/listings?${params}`).then((r) => r.json()) as { listings: JobListing[]; total: number };
    setListings(d.listings);
    setTotal(d.total);
  }

  async function loadCounts() {
    try {
      const s = await apiGet<Stats>(`${JOBS_API}/stats`);
      setCounts({ byStatus: s.listings.byStatus ?? {}, hidden: s.listings.hidden ?? 0 });
    } catch { /* badge count opsional — list tetap jalan */ }
  }

  useEffect(() => { load(page, tab, source); }, [page, tab, source]);
  useEffect(() => { loadCounts(); }, []);

  async function act(id: string, path: string, body?: unknown) {
    setBusy(id + path);
    await apiFetch(`${JOBS_API}/listings/${id}${path}`, body ? { method: "POST", body: JSON.stringify(body) } : { method: "POST" });
    await Promise.all([load(page, tab, source), loadCounts()]);
    setBusy("");
  }

  function switchTab(t: Tab) {
    setTab(t);
    setPage(1);
  }

  async function emptyTrash() {
    const n = counts.hidden;
    if (!n) return;
    if (!confirm(`Hapus permanen ${n} lowongan di Sampah? Tidak bisa dikembalikan.`)) return;
    if (!confirm(`Yakin? ${n} lowongan akan hilang selamanya.`)) return;
    setBusy("empty-trash");
    await apiFetch(`${JOBS_API}/listings?hidden=trash&confirm=yes`, { method: "DELETE" });
    await Promise.all([load(1, "Sampah", source), loadCounts()]);
    setPage(1);
    setBusy("");
  }

  function countFor(t: Tab): number {
    return t === "Sampah" ? counts.hidden : (counts.byStatus[t] ?? 0);
  }

  const tabBtn = (active: boolean) =>
    active
      ? "btn-primary text-sm"
      : "btn-secondary text-sm";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h1 className="text-xl font-bold">{tab} ({total})</h1>
        <div className="flex flex-wrap gap-2 items-center">
          <select className="input w-auto !py-1.5 text-sm" value={source} onChange={(e) => { setSource(e.target.value); setPage(1); }}>
            <option value="">Glints+JobStreet</option>
            <option value="glints">Glints</option>
            <option value="jobstreet">JobStreet</option>
          </select>
          {tab === "Sampah" && (
            <button className="btn-secondary text-sm !text-rose-600" disabled={busy !== "" || counts.hidden === 0} onClick={emptyTrash}>
              {busy === "empty-trash" ? "Menghapus..." : `Hapus Semua Sampah (${counts.hidden})`}
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t} className={tabBtn(tab === t)} onClick={() => switchTab(t)}>
            {t} ({countFor(t)})
          </button>
        ))}
      </div>
      <div className="text-sm text-zinc-500">Sort skor + terbaru. Item pindah tab otomatis setelah aksi. Hanya terverifikasi Remote yang masuk.</div>
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
              {tab === "New" && (
                <>
                  <button className="btn-secondary text-sm" disabled={busy !== ""} onClick={() => act(l.id, "/status", { status: "Saved" })}>Saved</button>
                  <button className="btn-secondary text-sm" disabled={busy !== ""} onClick={() => act(l.id, "/status", { status: "Applied" })}>Applied</button>
                  <button className="btn-secondary text-sm !text-rose-600" disabled={busy !== ""} onClick={() => { if (confirm("Hapus ke Sampah? (bukan fully remote)")) act(l.id, "/hide"); }}>Hapus</button>
                </>
              )}
              {tab === "Saved" && (
                <>
                  <button className="btn-secondary text-sm" disabled={busy !== ""} onClick={() => act(l.id, "/status", { status: "Applied" })}>Applied</button>
                  <button className="btn-secondary text-sm" disabled={busy !== ""} onClick={() => act(l.id, "/status", { status: "Interview" })}>Interview</button>
                  <button className="btn-secondary text-sm" disabled={busy !== ""} onClick={() => act(l.id, "/status", { status: "New" })}>Kembalikan ke New</button>
                  <button className="btn-secondary text-sm !text-rose-600" disabled={busy !== ""} onClick={() => { if (confirm("Hapus ke Sampah?")) act(l.id, "/hide"); }}>Hapus</button>
                </>
              )}
              {tab === "Applied" && (
                <>
                  <button className="btn-secondary text-sm" disabled={busy !== ""} onClick={() => act(l.id, "/status", { status: "Interview" })}>Interview</button>
                  <button className="btn-secondary text-sm" disabled={busy !== ""} onClick={() => act(l.id, "/status", { status: "New" })}>Kembalikan ke New</button>
                  <button className="btn-secondary text-sm !text-rose-600" disabled={busy !== ""} onClick={() => { if (confirm("Hapus ke Sampah?")) act(l.id, "/hide"); }}>Hapus</button>
                </>
              )}
              {(tab === "Interview" || tab === "Rejected") && (
                <>
                  <button className="btn-secondary text-sm" disabled={busy !== ""} onClick={() => act(l.id, "/status", { status: "New" })}>Kembalikan ke New</button>
                  <button className="btn-secondary text-sm !text-rose-600" disabled={busy !== ""} onClick={() => { if (confirm("Hapus ke Sampah?")) act(l.id, "/hide"); }}>Hapus</button>
                </>
              )}
              {tab === "Sampah" && (
                <>
                  <button className="btn-secondary text-sm" disabled={busy !== ""} onClick={() => act(l.id, "/restore")}>Kembalikan</button>
                  <button className="btn-secondary text-sm !text-rose-600" disabled={busy !== ""} onClick={() => { if (confirm("Hapus permanen?")) { setBusy(l.id); apiFetch(`${JOBS_API}/listings/${l.id}`, { method: "DELETE" }).then(() => Promise.all([load(page, tab, source), loadCounts()])).finally(() => setBusy("")); } }}>Hapus Permanen</button>
                </>
              )}
            </div>
          </div>
        ))}
        {listings.length === 0 && <div className="card p-8 text-center text-sm text-zinc-400">{EMPTY_TEXT[tab]}</div>}
      </div>
      <Pagination page={page} total={total} onChange={setPage} />
    </div>
  );
}
