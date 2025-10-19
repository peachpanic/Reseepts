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

async function fetchTopExpenses(userId: string): Promise<Expense[]> {
  console.log("Fetching top spend for userId: ", userId);
  const res = await fetch(`/api/expenses/top?id=${encodeURIComponent(userId)}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    console.error("Failed to fetch top expenses", res);
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to fetch top expenses");
  }
  console.log("Fetched top expenses", res);
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

export function useTopExpenses(userId?: string, limit: number = 5) {
  console.log("useTopExpenses called with userId:", userId, "limit:", limit);
  return useQuery({
    queryKey: ["topExpenses", userId, limit],
    queryFn: () => fetchTopExpenses(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: true,
  });
}
