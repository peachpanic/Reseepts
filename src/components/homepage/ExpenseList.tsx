"use client";

import ExpenseItem from "@/components/homepage/ExpenseItem";
import Link from "next/link";
import { useTransactions } from "@/hooks/useTransaction";
import ExpenseListSkeleton from "./Skeleton/ExpenseListSkeleton";
import { ChevronRight } from "lucide-react";

export default function ExpenseList() {
  const { data: expenses, isLoading } = useTransactions("1");

  if (isLoading) {
    return <ExpenseListSkeleton count={4} />;
  }
  return (
    <>
      <div className="flex flex-row justify-between items-center px-6 py-4 mb-2">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-gray-900">Expense History</h1>
          <p className="text-xs text-gray-500 mt-1">
            {expenses?.length || 0} recent transaction
            {expenses?.length !== 1 ? "s" : ""}
          </p>
        </div>  
        <Link
          href="/expenses"
          className="group flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#429690] to-teal-500 text-white rounded-full font-semibold text-sm hover:shadow-md transition-all active:scale-95 hover:scale-105 cursor-pointer"
        >
          <span>See all</span>
          <ChevronRight
            size={18}
            className="group-hover:translate-x-0.5 transition-transform"
          />
        </Link>
      </div>
      <div className="px-6 pb-4">
        {expenses && expenses.length > 0 ? (
          <div className="space-y-2">
            {expenses?.map((expense) => (
              <ExpenseItem key={expense.expense_id} expense={expense} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 bg-gray-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No expenses yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Start tracking your spending
            </p>
          </div>
        )}
      </div>
    </>
  );
}
