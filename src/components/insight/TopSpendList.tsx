"use client";

import ExpenseItem from "@/components/homepage/ExpenseItem";
import { useTopExpenses } from "@/hooks/useExpenses";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

type TopSpendProps = {
  period: string
}

export function TopSpendList({ period = "day" }: TopSpendProps) {
  const { data: expenses, isLoading } = useTopExpenses("1", period);
  if (isLoading) {
    return (
      <>
        <div>hello</div>
      </>
    );
  }
  return (
    <>
      <div className="flex flex-row justify-between items-center p-4">
        <h1 className="text-xl font-semibold">Top Spending</h1>
        <span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              console.log("ArrowUpDown clicked!");
            }}
          >
            <ArrowUpDown />
          </Button>
        </span>
      </div>
      <div className="mx-4">
        {expenses?.map((expense) => (
          <ExpenseItem key={expense.expense_id} expense={expense} />
        ))}
      </div>
    </>
  );
}
