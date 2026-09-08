"use client";

interface PaginationProps {
  page: number;
  total: number;
  pageSize?: number;
  onChange: (page: number) => void;
}

function pageWindow(page: number, totalPages: number): (number | "…")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const set = new Set<number>([1, 2, page - 1, page, page + 1, totalPages - 1, totalPages]);
  const nums = [...set].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  let prev = 0;
  for (const n of nums) {
    if (n - prev > 1) out.push("…");
    out.push(n);
    prev = n;
  }
  return out;
}

export function Pagination({ page, total, pageSize = 10, onChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const btn =
    "inline-flex items-center justify-center min-w-8 h-8 px-2 rounded-lg text-xs font-medium border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:pointer-events-none";

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-xs text-zinc-500">
        Menampilkan {start}–{end} dari {total}
      </p>
      <div className="flex items-center gap-1">
        <button className={btn} onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Halaman sebelumnya">
          ‹
        </button>
        {pageWindow(page, totalPages).map((p, i) =>
          p === "…" ? (
            <span key={`e${i}`} className="px-1 text-xs text-zinc-400">…</span>
          ) : (
            <button
              key={p}
              className={
                btn +
                (p === page
                  ? " !bg-zinc-900 !text-white !border-zinc-900 dark:!bg-zinc-100 dark:!text-zinc-900 dark:!border-zinc-100"
                  : "")
              }
              onClick={() => onChange(p)}
              disabled={p === page}
            >
              {p}
            </button>
          )
        )}
        <button className={btn} onClick={() => onChange(page + 1)} disabled={page >= totalPages} aria-label="Halaman berikutnya">
          ›
        </button>
      </div>
    </div>
  );
}
