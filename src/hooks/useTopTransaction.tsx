"use client"

import { useQuery } from "@tanstack/react-query"
import { Transaction } from "@/lib/definitions";

async function fetchTopTransactions(userId: string, period?: string): Promise<Transaction[]> {
    console.log("Fetching top expenses for userId:", userId, "period:", period);

    const params = new URLSearchParams({ id: userId });
    if (period) {
        params.append("period", period);
    }

    const res = await fetch(`/api/expenses/top?${params.toString()}`, {
        cache: "no-store",
    });

    if (!res.ok) {
        console.error("Failed to fetch top expenses", res.status);
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error || "Failed to fetch top expenses");
    }

    const json = await res.json();
    console.log("Fetched top expenses:", json.expenses?.length || 0, "items");
    return json.expenses as Transaction[];
}
// Hook specifically for top expenses with period filter
export function useTopTransactions(userId?: string, period?: string) {
    return useQuery({
        queryKey: ["topExpenses", userId, period],
        queryFn: () => fetchTopTransactions(userId!, period),
        enabled: !!userId,
        staleTime: 1000 * 60 * 2, // Consider data fresh for 2 minutes
    });
}