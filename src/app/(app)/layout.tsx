"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/logout-button";
import { apiFetch, redirectToLogin } from "@/lib/api";
import {
  DashboardIcon,
  StackIcon,
  PersonIcon,
  PlusIcon,
  GearIcon,
} from "@radix-ui/react-icons";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    apiFetch("/api/me")
      .then((res) => {
        if (res.ok) {
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
          redirectToLogin();
        }
      })
      .catch(() => {
        setAuthenticated(false);
        redirectToLogin();
      });
  }, []);

  if (authenticated !== true) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <span className="inline-flex items-center justify-center size-10 rounded-xl bg-brand-500 text-brand-950 font-bold text-lg animate-pulse">
            B
          </span>
          <p className="text-xs text-zinc-400 font-medium">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex">
      <aside className="w-60 shrink-0 bg-zinc-950 text-zinc-200 p-4 hidden md:flex flex-col fixed inset-y-0">
        <div className="flex items-center gap-2.5 px-2 py-3 mb-6">
          <span className="inline-flex items-center justify-center size-8 rounded-lg bg-brand-500 text-brand-950 font-bold">
            B
          </span>
          <span className="text-base font-semibold text-white">
            Bearich Outreach
          </span>
        </div>

        <nav className="flex flex-col gap-1 text-sm">
          <Link href="/" className="nav-link">
            <DashboardIcon />
            Dashboard
          </Link>
          <Link href="/outreach" className="nav-link">
            <StackIcon />
            Outreach Queue
          </Link>
          <Link href="/prospects" className="nav-link">
            <PersonIcon />
            Prospects
          </Link>
          <Link href="/prospects/new" className="nav-link">
            <PlusIcon />
            + Tambah Prospek
          </Link>
          <Link href="/settings" className="nav-link">
            <GearIcon />
            Settings
          </Link>
        </nav>

        <div className="mt-auto space-y-1">
          <ThemeToggle />
          <LogoutButton />
        </div>
      </aside>

      <div className="flex-1 md:ml-60 flex flex-col min-h-[100dvh]">
        <header className="md:hidden sticky top-0 z-40 bg-zinc-950 text-zinc-200 px-4 pt-3 pb-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-semibold text-white">
              <span className="inline-flex items-center justify-center size-7 rounded-lg bg-brand-500 text-brand-950 font-bold text-xs">
                B
              </span>
              Bearich Outreach
            </span>
            <div className="flex items-center gap-1">
              <ThemeToggle compact />
              <LogoutButton compact />
            </div>
          </div>
          <nav className="mt-2 flex gap-1 overflow-x-auto text-sm -mx-1 px-1">
            <Link href="/" className="nav-link shrink-0">Dashboard</Link>
            <Link href="/outreach" className="nav-link shrink-0">Queue</Link>
            <Link href="/prospects" className="nav-link shrink-0">Prospects</Link>
            <Link href="/prospects/new" className="nav-link shrink-0">+ Tambah</Link>
            <Link href="/settings" className="nav-link shrink-0">Settings</Link>
          </nav>
        </header>
        <main className="p-4 md:p-6 max-w-6xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}