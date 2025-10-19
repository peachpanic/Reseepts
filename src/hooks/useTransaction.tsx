"use client";
import { useQuery } from "@tanstack/react-query";
import { Transaction } from "@/lib/definitions";

type RawTransaction = any; // supabase returns loose JSON
type TransactionWithItems = RawTransaction & { transaction_items?: any[] };

async function fetchTransactions(userId: string) {
  const res = await fetch(`/api/expenses?id=${encodeURIComponent(userId)}`, {
    cache: "no-store",
  });
  const json = await res.json();
  const transactions: TransactionWithItems[] = (json.transactions || []).map(
    (t: RawTransaction) => ({
      ...t,
      expense_date: t.expense_date ? new Date(t.expense_date) : null,
      created_at: t.created_at ? new Date(t.created_at) : null,
      transaction_items: (t.transaction_items || []).map((it: any) => ({
        ...it,
        created_at: it.created_at ? new Date(it.created_at) : null,
      })),
    })
  );
  return transactions;
}

export function useTransactions(userId?: string) {
  console.log("useExpenses called with userId:", userId);
  return useQuery({
    queryKey: ["transactions", userId],
    queryFn: () => fetchTransactions(userId!),
    enabled: !!userId,
  });
}
