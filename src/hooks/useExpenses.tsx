"use client";
import { useQuery } from "@tanstack/react-query";
import { Expense } from "@/lib/definitions";

async function fetchExpenses(userId: string): Promise<Expense[]> {
  console.log("Fetching expenses for userId:", userId);
  const res = await fetch(`/api/expenses?id=${encodeURIComponent(userId)}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    console.error("Failed to fetch expenses", res);
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error);
  }
  console.log("Fetched expenses", res);
  const json = await res.json();
  return json.expenses as Expense[];
}

export function useExpenses(userId?: string) {
  console.log("useExpenses called with userId:", userId);
  return useQuery({
    queryKey: ["expenses", userId],
    queryFn: () => fetchExpenses(userId!),
    enabled: !!userId,
  });
}

export function useTotalMonthlyExpense(userId: string) {
  return useQuery({
    queryKey: ["totalMonthlyExpense", userId],
    queryFn: () => fetchTotalMonthlyExpense(userId),
    enabled: !!userId,
  });
}

async function fetchTotalMonthlyExpense(userId: string): Promise<number> {
  console.log("Fetching total monthly expense for userId:", userId);
  const res = await fetch(`/api/expenses/total?id=${encodeURIComponent(userId)}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    console.error("Failed to fetch total monthly expense", res);
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error);
  }
  const json = await res.json();
  return json.total as number;
}
