"use client";

import ExpenseItem from "@/components/homepage/ExpenseItem";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { useSession } from "next-auth/react";

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

export function TopSpendList() {
  // const { data: session, status } = useSession();
  // const { data: expenses, isLoading } = useExpenses(session?.user?.id ?? null);

  // Use mock data instead
  const expenses = mockExpenses;
  const isLoading = false;

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
      <div className="mx-4 space-y-2">
        {expenses?.map((expense) => (
          <ExpenseItem key={expense.expense_id} expense={expense} />
        ))}
      </div>
    </>
  );
}
