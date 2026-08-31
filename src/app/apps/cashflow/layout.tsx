"use client";

import Link from "next/link";
import {
  DashboardIcon,
  TableIcon,
  PlusIcon,
  CardStackIcon,
  ShuffleIcon,
  ArrowLeftIcon,
} from "@radix-ui/react-icons";
import { AppAuthGate } from "@/components/app-auth-gate";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV = [
  { href: "/apps/cashflow", label: "Dashboard", icon: DashboardIcon },
  { href: "/apps/cashflow/transactions", label: "Transaksi", icon: TableIcon },
  { href: "/apps/cashflow/accounts", label: "Akun", icon: CardStackIcon },
  { href: "/apps/cashflow/transfer", label: "Transfer", icon: ShuffleIcon },
  { href: "/apps/cashflow/transactions/new", label: "+ Catat Transaksi", icon: PlusIcon },
];

export default function CashflowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppAuthGate slug="cashflow">
      <CashflowShell>{children}</CashflowShell>
    </AppAuthGate>
  );
}

function CashflowShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex">
      <aside className="w-60 shrink-0 bg-zinc-950 text-zinc-200 p-4 hidden md:flex flex-col fixed inset-y-0">
        <div className="flex items-center gap-2.5 px-2 py-3 mb-6">
          <span className="inline-flex items-center justify-center size-8 rounded-lg bg-brand-500 text-brand-950 font-bold">
            C
          </span>
          <span className="text-base font-semibold text-white">Cash Flow</span>
        </div>

        <nav className="flex flex-col gap-1 text-sm">
          {NAV.map((l) => (
            <Link key={l.href} href={l.href} className="nav-link">
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
                C
              </span>
              Cash Flow
            </span>
            <div className="flex items-center gap-1">
              <ThemeToggle compact />
            </div>
          </div>
          <nav className="mt-2 flex gap-1 overflow-x-auto text-sm -mx-1 px-1">
            {NAV.map((l) => (
              <Link key={l.href} href={l.href} className="nav-link shrink-0">
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