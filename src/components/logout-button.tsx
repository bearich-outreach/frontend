"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExitIcon } from "@radix-ui/react-icons";
import { apiFetch } from "@/lib/api";

export function LogoutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    await apiFetch("/api/logout", { method: "GET" }).catch(() => {});
    router.replace("/login");
    router.refresh();
  }

  if (compact) {
    return (
      <button
        onClick={logout}
        disabled={busy}
        className="flex items-center justify-center size-9 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/70 transition-colors"
        aria-label="Keluar"
      >
        <ExitIcon />
      </button>
    );
  }

  return (
    <button
      onClick={logout}
      disabled={busy}
      className="nav-link w-full text-left"
    >
      <ExitIcon />
      Keluar
    </button>
  );
}