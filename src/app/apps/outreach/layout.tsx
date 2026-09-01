"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DashboardIcon,
  StackIcon,
  PersonIcon,
  PlusIcon,
  GearIcon,
  ArrowLeftIcon,
} from "@radix-ui/react-icons";
import { AppAuthGate } from "@/components/app-auth-gate";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV = [
  { href: "/apps/outreach", label: "Dashboard", icon: DashboardIcon },
  { href: "/apps/outreach/queue", label: "Outreach Queue", icon: StackIcon },
  { href: "/apps/outreach/prospects", label: "Prospects", icon: PersonIcon },
  { href: "/apps/outreach/prospects/new", label: "+ Tambah Prospek", icon: PlusIcon },
  { href: "/apps/outreach/settings", label: "Settings", icon: GearIcon },
];

export default function OutreachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppAuthGate slug="outreach">
      <OutreachShell>{children}</OutreachShell>
    </AppAuthGate>
  );
}

function OutreachShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/apps/outreach"
      ? pathname === href
      : pathname === href || pathname.startsWith(href + "/");

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
          {NAV.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={isActive(l.href) ? "nav-link-active" : "nav-link"}
            >
              <l.icon />
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
                B
              </span>
              Bearich Outreach
            </span>
            <div className="flex items-center gap-1">
              <ThemeToggle compact />
            </div>
          </div>
          <nav className="mt-2 flex gap-1 overflow-x-auto text-sm -mx-1 px-1">
            {NAV.map((l) => (
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