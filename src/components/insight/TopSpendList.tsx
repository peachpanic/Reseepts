"use client";

import ExpenseItem from "@/components/homepage/ExpenseItem";
import Link from "next/link";
import { useExpenses } from "@/hooks/useTransaction";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TopSpendList() {
  const { data: expenses, isLoading } = useExpenses("1");
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
