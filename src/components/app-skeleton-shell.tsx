"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowLeftIcon, HamburgerMenuIcon, Cross1Icon } from "@radix-ui/react-icons";
import { AppAuthGate } from "@/components/app-auth-gate";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppSkeletonShell({
  slug,
  appName,
  nav,
  children,
}: {
  slug: string;
  appName: string;
  nav: { href: string; label: string }[];
  children: React.ReactNode;
}) {
  return (
    <AppAuthGate slug={slug}>
      <Shell appName={appName} nav={nav}>
        {children}
      </Shell>
    </AppAuthGate>
  );
}

function Shell({
  appName,
  nav,
  children,
}: {
  appName: string;
  nav: { href: string; label: string }[];
  children: React.ReactNode;
}) {
  const initial = appName.charAt(0).toUpperCase();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="min-h-[100dvh] flex">
      <aside className="w-60 shrink-0 bg-zinc-950 text-zinc-200 p-4 hidden md:flex flex-col fixed inset-y-0">
        <div className="flex items-center gap-2.5 px-2 py-3 mb-6">
          <span className="inline-flex items-center justify-center size-8 rounded-lg bg-brand-500 text-brand-950 font-bold">
            {initial}
          </span>
          <span className="text-base font-semibold text-white">{appName}</span>
        </div>

        <nav className="flex flex-col gap-1 text-sm">
          {nav.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={isActive(l.href) ? "nav-link-active" : "nav-link"}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto space-y-1">
          <ThemeToggle />
          <Link href="/" className="nav-link">
            <ArrowLeftIcon />
            Kembali ke platform
          </Link>
        </div>
      </aside>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-zinc-950 text-zinc-200 p-4 flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between px-2 py-3 mb-6">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center justify-center size-8 rounded-lg bg-brand-500 text-brand-950 font-bold">
                  {initial}
                </span>
                <span className="text-base font-semibold text-white">{appName}</span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="inline-flex items-center justify-center size-8 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
                aria-label="Tutup menu"
              >
                <Cross1Icon className="size-4" />
              </button>
            </div>
            <nav className="flex flex-col gap-1 text-sm">
              {nav.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setDrawerOpen(false)}
                  className={isActive(l.href) ? "nav-link-active" : "nav-link"}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto space-y-1 pt-6">
              <ThemeToggle />
              <Link href="/" className="nav-link" onClick={() => setDrawerOpen(false)}>
                <ArrowLeftIcon />
                Kembali ke platform
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 md:ml-60 flex flex-col min-h-[100dvh] w-full min-w-0">
        <header className="md:hidden sticky top-0 z-40 bg-zinc-950 text-zinc-200">
          <div className="flex items-center justify-between px-3 py-2.5 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={() => setDrawerOpen(true)}
                className="inline-flex items-center justify-center size-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white shrink-0"
                aria-label="Buka menu"
              >
                <HamburgerMenuIcon className="size-4" />
              </button>
              <span className="flex items-center gap-2 text-sm font-semibold text-white min-w-0 truncate">
                <span className="inline-flex items-center justify-center size-7 rounded-lg bg-brand-500 text-brand-950 font-bold text-xs shrink-0">
                  {initial}
                </span>
                <span className="truncate">{appName}</span>
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <ThemeToggle compact />
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto scrollbar-none text-sm px-2 pb-2 -mx-1">
            <div className="flex gap-1 px-1">
              {nav.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`${isActive(l.href) ? "nav-link-active" : "nav-link"} shrink-0 whitespace-nowrap text-xs px-2.5 py-1.5`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </nav>
        </header>
        <main className="p-3 sm:p-4 md:p-6 max-w-6xl mx-auto w-full min-w-0">{children}</main>
      </div>
    </div>
  );
}