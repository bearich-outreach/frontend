"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
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

      <div className="flex-1 md:ml-60 flex flex-col min-h-[100dvh]">
        <header className="md:hidden sticky top-0 z-40 bg-zinc-950 text-zinc-200 px-4 pt-3 pb-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-semibold text-white">
              <span className="inline-flex items-center justify-center size-7 rounded-lg bg-brand-500 text-brand-950 font-bold text-xs">
                {initial}
              </span>
              {appName}
            </span>
            <div className="flex items-center gap-1">
              <ThemeToggle compact />
            </div>
          </div>
          <nav className="mt-2 flex gap-1 overflow-x-auto text-sm -mx-1 px-1">
            {nav.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={isActive(l.href) ? "nav-link-active shrink-0" : "nav-link shrink-0"}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="p-4 md:p-6 max-w-6xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}