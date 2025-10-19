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

export function useExpenses(userId: string | null) {
  console.log("useExpenses called with userId:", userId);
  return useQuery({
    queryKey: ["expenses", userId],
    queryFn: () => fetchExpenses(userId!),
    enabled: !!userId,
  });
}
