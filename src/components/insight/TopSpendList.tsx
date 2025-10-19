"use client";

import ExpenseItem from "@/components/homepage/ExpenseItem";
import { Button } from "@/components/ui/button";
import { useTopTransactions } from "@/hooks/useTopTransaction";
import { ArrowUpDown } from "lucide-react";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton"; // Add this import

const mockExpenses = [
  {
    expense_id: "1",
    user_id: "mock-user",
    category_id: "1",
    category: "Food",
    description: "Lunch at restaurant",
    payment_method: "card",
    source: "manual",
    expense_date: "2023-10-01",
    amount: 25.5,
    created_at: "2023-10-01T12:00:00Z",
    updated_at: "2023-10-01T12:00:00Z",
  },
  {
    expense_id: "2",
    user_id: "mock-user",
    category_id: "2",
    category: "Transportation",
    description: "Gas station",
    payment_method: "card",
    source: "manual",
    expense_date: "2023-10-02",
    amount: 40.0,
    created_at: "2023-10-02T12:00:00Z",
    updated_at: "2023-10-02T12:00:00Z",
  },
  {
    expense_id: "3",
    user_id: "mock-user",
    category_id: "3",
    category: "Entertainment",
    description: "Movie tickets",
    payment_method: "card",
    source: "manual",
    expense_date: "2023-10-03",
    amount: 15.0,
    created_at: "2023-10-03T12:00:00Z",
    updated_at: "2023-10-03T12:00:00Z",
  },
];

type TopSpendProps = {
  period: string;
};

export function TopSpendList({ period = "day" }: TopSpendProps) {
  const { data: session, status } = useSession();

  const { data: expenses, isLoading } = useTopTransactions("1", period);

  if (isLoading) {
    return (
      <>
        <div className="flex flex-row justify-between items-center p-4">
          <h1 className="text-xl font-semibold">Top Spending</h1>
          <span>
            <Button variant="ghost" size="sm" disabled>
              <ArrowUpDown />
            </Button>
          </span>
        </div>
        <div className="mx-4 space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-row p-2 rounded-md border-black justify-between bg-teal-700 items-center"
            >
              <div className="flex flex-col space-y-1">
                <Skeleton className="h-4 w-32 bg-gray-600" />
                <Skeleton className="h-3 w-24 bg-gray-600" />
              </div>
              <Skeleton className="h-4 w-16 bg-gray-600" />
            </div>
          ))}
        </div>
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
      <div className="mx-4 space-y-2">
        {expenses?.map((expense, index) => (
          <ExpenseItem
            key={expense.expense_id}
            expense={expense}
            className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
          />
        ))}
      </div>
    </>
  );
}
