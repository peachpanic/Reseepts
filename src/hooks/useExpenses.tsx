// "use client";
// import { useQuery } from "@tanstack/react-query";
// import { Transaction } from "@/lib/definitions";

// async function fetchExpenses(userId: string, period?: string): Promise<Transaction[]> {
//   console.log("Fetching expenses for userId:", userId, "period:", period);
  
//   const params = new URLSearchParams({ id: userId });
//   if (period) {
//     params.append("period", period);
//   }
  
//   const res = await fetch(`/api/expenses?${params.toString()}`, {
//     cache: "no-store",
//   });
  
//   if (!res.ok) {
//     console.error("Failed to fetch expenses", res.status);
//     const err = await res.json().catch(() => ({ error: "Unknown error" }));
//     throw new Error(err.error || "Failed to fetch expenses");
//   }
  
//   const json = await res.json();
//   console.log("Fetched expenses:", json.expenses?.length || 0, "items");
//   return json.expenses as Expense[];
// }

// async function fetchTopExpenses(userId: string, period?: string): Promise<Transaction[]> {
//   console.log("Fetching top expenses for userId:", userId, "period:", period);
  
//   const params = new URLSearchParams({ id: userId });
//   if (period) {
//     params.append("period", period);
//   }
  
//   const res = await fetch(`/api/expenses/top?${params.toString()}`, {
//     cache: "no-store",
//   });
  
//   if (!res.ok) {
//     console.error("Failed to fetch top expenses", res.status);
//     const err = await res.json().catch(() => ({ error: "Unknown error" }));
//     throw new Error(err.error || "Failed to fetch top expenses");
//   }
  
//   const json = await res.json();
//   console.log("Fetched top expenses:", json.expenses?.length || 0, "items");
//   return json.expenses as Expense[];
// }

// // Hook for general expenses with optional period filter
// export function useExpenses(userId?: string, period?: string) {
//   return useQuery({
//     queryKey: ["expenses", userId, period],
//     queryFn: () => fetchExpenses(userId!, period),
//     enabled: !!userId,
//     staleTime: 1000 * 60 * 2, // Consider data fresh for 2 minutes
//   });
// }

// // Hook specifically for top expenses with period filter
// export function useTopExpenses(userId?: string, period?: string) {
//   return useQuery({
//     queryKey: ["topExpenses", userId, period],
//     queryFn: () => fetchTopExpenses(userId!, period),
//     enabled: !!userId,
//     staleTime: 1000 * 60 * 2, // Consider data fresh for 2 minutes
//   });
// }
