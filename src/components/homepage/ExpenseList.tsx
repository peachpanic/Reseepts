"use client";

import ExpenseItem from "@/components/homepage/ExpenseItem";
import Link from "next/link";
import { useTransactions } from "@/hooks/useTransaction";
import ExpenseListSkeleton from "./Skeleton/ExpenseListSkeleton";

export default function ExpenseList() {
  const { data: expenses, isLoading } = useTransactions("1");

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
      <div className="mx-4 space-y-2">
        {expenses?.map((expense, index) => (
          <ExpenseItem
            className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
            key={expense.expense_id}
            expense={expense}
          />
        ))}
      </div>
    </>
  );
}
