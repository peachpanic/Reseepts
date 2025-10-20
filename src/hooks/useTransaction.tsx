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
  sortBy?: "amount" | "date";
  sortOrder?: "asc" | "desc";
};

type RawTransaction = any; // supabase returns loose JSON
type TransactionWithItems = RawTransaction & { transaction_items?: any[] };

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

async function fetchTransactions(
  filters: TransactionFilters
): Promise<Transaction[]> {
  const {
    userId,
    period,
    limit,
    sortBy = "date",
    sortOrder = "desc",
  } = filters;

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
    sortBy?: "amount" | "date";
    sortOrder?: "asc" | "desc";
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
  console.log("=== ADD TRANSACTION DEBUG ===");
  console.log("Original expense:", JSON.stringify(expense, null, 2));

  // Ensure user_id is set to 1 and all required fields exist
  const transactionToSend = {
    user_id: 1,
    category_id: expense.category_id || null,
    amount: expense.amount || 0,
    description: expense.description || "",
    payment_method: expense.payment_method || "cash",
    expense_date: expense.expense_date || new Date().toISOString(),
    created_at: expense.created_at || new Date().toISOString(),
    transaction_items: expense.transaction_items || [],
  };

  console.log(
    "Transaction to send:",
    JSON.stringify(transactionToSend, null, 2)
  );
  console.log("Amount value:", transactionToSend.amount);
  console.log("Amount type:", typeof transactionToSend.amount);

  const res = await fetch("/api/expenses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(transactionToSend),
  });

  const responseText = await res.text();
  console.log("API Response:", responseText);

  if (!res.ok) {
    let errorData;
    try {
      errorData = JSON.parse(responseText);
    } catch {
      errorData = { error: responseText };
    }
    throw new Error(errorData.error || "Failed to add transaction");
  }

  const json = JSON.parse(responseText);
  return json;
}

export default function useOCRData() {
  const queryClient = new QueryClient();
  return useMutation({
    mutationFn: async (expense: any) => {
      console.log("=== MUTATION DEBUG ===");
      console.log(
        "Expense passed to mutation:",
        JSON.stringify(expense, null, 2)
      );

      // Ensure user_id is 1 and amount exists before calling addTransaction
      const expenseWithUserId = {
        ...expense,
        user_id: 1,
        amount: expense.amount || 0,
      };

      console.log(
        "Expense with user_id:",
        JSON.stringify(expenseWithUserId, null, 2)
      );

      return addTransaction(expenseWithUserId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["transactions", 1],
      });
    },
    onError: (error: any) => {
      console.error("=== MUTATION ERROR ===");
      console.error("Error:", error);
      console.error("Error message:", error?.message);
    },
  });
}

// Convenience hook for top spending (syntactic sugar)
export function useTopTransactions(
  userId?: string,
  period?: string,
  limit: number = 10
) {
  return useTransactions(userId, {
    period,
    limit,
    sortBy: "amount",
    sortOrder: "desc",
  });
}
