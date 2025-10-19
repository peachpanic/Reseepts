"use client";

import { Expense } from "@/lib/definitions";

export default function ExpenseItem({ expense }: { expense: Expense }) {
  // Convert expense_date to Date object if it's a string
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString(undefined, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="flex flex-row p-2 rounded-md border-black justify-between bg-teal-700 items-center">
      <div className="flex flex-col">
        <span className="font-semibold text-white">{expense.description}</span>
        <span className="text-gray-300 text-xs">
          {new Date(expense.expense_date).toLocaleDateString("en-PH", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
      </div>
      <span className="font-bold text-white">₱{expense.amount.toFixed(2)}</span>
    </div>
  );
}
