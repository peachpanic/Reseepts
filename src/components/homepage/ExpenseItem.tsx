"use client";

import { Expense } from "@/lib/definitions";

export default function ExpenseItem({ expense }: { expense: Expense }) {
  // Convert expense_date to Date object if it's a string
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString(undefined, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="flex flex-row py-4 px-2 border-black justify-between">
      <div className="flex flex-col">
        <span className="font-medium">{expense.expense_id}</span>
        <span className="text-gray-600 text-sm">
          {formatDate(expense.expense_date)}
        </span>
      </div>
      <span className="text-red-600 font-bold">{expense.amount}</span>
    </div>
  );
}
