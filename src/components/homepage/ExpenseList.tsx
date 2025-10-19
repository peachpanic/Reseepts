"use client";

import ExpenseItem from "./ExpenseItem";
import Link from "next/link";
import { useExpenses } from "@/hooks/useExpenses";
import ExpenseListSkeleton from "./Skeleton/ExpenseListSkeleton";

export default function ExpenseList() {
  const { data: expenses, isLoading } = useExpenses("1");

  if (isLoading) {
    return <ExpenseListSkeleton count={4} />;
  }
  return (
    <>
      <div className="flex flex-row justify-between items-center p-4">
        <h1 className="text-xl font-semibold">Expense History</h1>
        <span>
          <Link href="/expenses">See all</Link>
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
