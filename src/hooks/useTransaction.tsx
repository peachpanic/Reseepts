// "use client";
// import { useQuery } from "@tanstack/react-query";
// import { Transaction } from "@/lib/definitions";

// type RawTransaction = any; // supabase returns loose JSON
// type TransactionWithItems = RawTransaction & { transaction_items?: any[] };

// async function fetchTransactions(userId: string) {
//   const res = await fetch(`/api/expenses?id=${encodeURIComponent(userId)}`, {
//     cache: "no-store",
//   });
//   const json = await res.json();
//   const transactions: TransactionWithItems[] = (json.transactions || []).map(
//     (t: RawTransaction) => ({
//       ...t,
//       expense_date: t.expense_date ? new Date(t.expense_date) : null,
//       created_at: t.created_at ? new Date(t.created_at) : null,
//       transaction_items: (t.transaction_items || []).map((it: any) => ({
//         ...it,
//         created_at: it.created_at ? new Date(it.created_at) : null,
//       })),
//     })
//   );
//   return transactions;
// }

// export function useTransactions(userId?: string) {
//   console.log("useExpenses called with userId:", userId);
//   return useQuery({
//     queryKey: ["transactions", userId],
//     queryFn: () => fetchTransactions(userId!),
//     enabled: !!userId,
//   });
// }

"use client";
import { useQuery, useMutation, QueryClient } from "@tanstack/react-query";
import { Transaction } from "@/lib/definitions";

type TransactionFilters = {
  userId: string;
  period?: string;
  limit?: number;
  sortBy?: 'amount' | 'date';
  sortOrder?: 'asc' | 'desc';
}

function transformTransaction(raw: any): Transaction {
  return {
    ...raw,
    expense_date: raw.expense_date ? new Date(raw.expense_date) : null,
    created_at: raw.created_at ? new Date(raw.created_at) : null,
    transaction_items: (raw.transaction_items || []).map((item: any) => ({
      ...item,
      created_at: item.created_at ? new Date(item.created_at) : null,
    })),
  };
}

async function fetchTransactions(filters: TransactionFilters): Promise<Transaction[]> {
  const { userId, period, limit, sortBy = 'date', sortOrder = 'desc' } = filters;

  const params = new URLSearchParams({ id: userId });
  if (period) params.append("period", period);
  if (limit) params.append("limit", limit.toString());
  if (sortBy) params.append("sortBy", sortBy);
  if (sortOrder) params.append("sortOrder", sortOrder);

  const res = await fetch(`/api/expenses?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || "Failed to fetch transactions");
  }

  const json = await res.json();
  const rawTransactions = json.transactions || json.expenses || [];

  // Always transform consistently
  return rawTransactions.map(transformTransaction);
}

// Main hook with flexible options
export function useTransactions(
  userId?: string,
  options?: {
    period?: string;
    limit?: number;
    sortBy?: 'amount' | 'date';
    sortOrder?: 'asc' | 'desc';
  }
) {
  return useQuery({
    queryKey: ["transactions", userId, options],
    queryFn: () => fetchTransactions({ userId: userId!, ...options }),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}

// adding mutation

async function addTransaction(expense: Transaction) {
  console.log("yo mama")
  console.log("Adding transaction:", expense);
  const res = await fetch("/api/expenses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ transaction: expense }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to add transaction");
  }

  const json = await res.json();
  return json;
}

export default function useOCRData() {
  const queryClient = new QueryClient();
  return useMutation({
    mutationFn: async (expense: any) => addTransaction(expense),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["transactions", variables.user_id],
      });
    },
  });
}

// Convenience hook for top spending (syntactic sugar)
export function useTopTransactions(userId?: string, period?: string, limit: number = 10) {
  return useTransactions(userId, {
    period,
    limit,
    sortBy: 'amount',
    sortOrder: 'desc'
  });
}