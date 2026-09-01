"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CashflowTransactionForm } from "@/components/cashflow-transaction-form";
import { CASHFLOW_API, apiFetch } from "@/lib/api";

export default function NewTransactionPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function submit(data: {
    type: "in" | "out";
    amount: number;
    category: string;
    description: string;
    date: string;
  }) {
    setBusy(true);
    const res = await apiFetch(`${CASHFLOW_API}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setBusy(false);
    if (res.ok) {
      router.push("/apps/cashflow/transactions");
    } else {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      alert(d.error || "Gagal menyimpan transaksi.");
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Catat Transaksi
        </h1>
        <p className="text-sm text-zinc-500">
          Pencatatan uang masuk atau uang keluar.
        </p>
      </div>

      <div className="card p-4 sm:p-6">
        <CashflowTransactionForm onSubmit={submit} submitLabel="Simpan Transaksi" busy={busy} />
      </div>
    </div>
  );
}