"use client";

import ExpenseItem from "./ExpenseItem";
import Link from "next/link";
import { useExpenses } from "@/hooks/useExpenses";

export default function ExpenseList() {
  const { data: expense, isLoading } = useExpenses("1");
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
        <h1 className="text-xl font-semibold">Expense History</h1>
        <span>
          <Link href="/expenses">See all</Link>
        </span>
      </div>
      <div>
        {expense?.map((expense) => (
          <ExpenseItem key={expense.expense_id} expense={expense} />
        ))}
      </div>
    </>
  );
}
