import { ExpenseItem } from "@/components/homepage/ExpenseItem";
import Link from "next/link";
import { Expense } from "@/lib/definitions";

export function ExpenseList() {
  const expenses: Expense[] = [
    {
      expense_id: 1,
      user_id: 101,
      category_id: 1, // Groceries
      amount: 2456.75,
      description: "Weekly grocery run",
      payment_method: "credit_card",
      source: "SM Supermarket",
      emotion_tag: "content",
      expense_date: new Date("2025-10-18T12:15:00Z"),
      created_at: new Date("2025-10-18T12:20:10Z"),
    },
    {
      expense_id: 2,
      user_id: 101,
      category_id: 2, // Dining
      amount: 420.0,
      description: "Lunch with team",
      payment_method: "GCash",
      source: "Jollibee",
      emotion_tag: "happy",
      expense_date: new Date("2025-10-17T04:30:00Z"),
      created_at: new Date("2025-10-17T04:35:42Z"),
    },
    {
      expense_id: 3,
      user_id: 101,
      category_id: 3, // Transport
      amount: 150.5,
      description: "Ride to office",
      payment_method: "cash",
      source: "Grab",
      emotion_tag: "rushed",
      expense_date: new Date("2025-10-16T23:10:00Z"),
      created_at: new Date("2025-10-16T23:11:22Z"),
    },
    {
      expense_id: 4,
      user_id: 101,
      category_id: 4, // Utilities
      amount: 3200.0,
      description: "Monthly electricity bill",
      payment_method: "bank_transfer",
      source: "Meralco",
      emotion_tag: "annoyed",
      expense_date: new Date("2025-10-10T08:00:00Z"),
      created_at: new Date("2025-10-10T08:05:00Z"),
    },
    {
      expense_id: 5,
      user_id: 101,
      category_id: 5, // Entertainment
      amount: 459.0,
      description: "Monthly subscription",
      payment_method: "debit_card",
      source: "Netflix",
      emotion_tag: "relaxed",
      expense_date: new Date("2025-10-05T14:00:00Z"),
      created_at: new Date("2025-10-05T14:01:15Z"),
    },
    {
      expense_id: 6,
      user_id: 101,
      category_id: 6, // Healthcare
      amount: 899.25,
      description: "Vitamins and meds",
      payment_method: "GCash",
      source: "Watsons",
      emotion_tag: "relieved",
      expense_date: new Date("2025-09-28T07:45:00Z"),
      created_at: new Date("2025-09-28T07:49:00Z"),
    },
    {
      expense_id: 7,
      user_id: 101,
      category_id: 7, // Housing
      amount: 15000.0,
      description: "October rent",
      payment_method: "bank_transfer",
      source: "Landlord",
      emotion_tag: "secure",
      expense_date: new Date("2025-10-01T02:00:00Z"),
      created_at: new Date("2025-10-01T02:03:00Z"),
    },
    {
      expense_id: 8,
      user_id: 102,
      category_id: 8, // Travel
      amount: 5680.0,
      description: "Round-trip flight (MNL-CEB)",
      payment_method: "credit_card",
      source: "Cebu Pacific",
      emotion_tag: "excited",
      expense_date: new Date("2025-09-15T03:20:00Z"),
      created_at: new Date("2025-09-15T03:25:00Z"),
    },
    {
      expense_id: 9,
      user_id: 101,
      category_id: 9, // Shopping
      amount: 1299.0,
      description: "Wireless mouse",
      payment_method: "Maya",
      source: "Shopee",
      emotion_tag: "impulse",
      expense_date: new Date("2025-09-12T11:10:00Z"),
      created_at: new Date("2025-09-12T11:12:10Z"),
    },
    {
      expense_id: 10,
      user_id: 101,
      category_id: 10, // Education
      amount: 7500.0,
      description: "Online course (TypeScript)",
      payment_method: "credit_card",
      source: "Udemy",
      emotion_tag: "motivated",
      expense_date: new Date("2025-08-22T06:00:00Z"),
      created_at: new Date("2025-08-22T06:02:45Z"),
    },
  ];

  return (
    <>
      <div className="flex flex-row justify-between items-center p-4">
        <h1 className="text-xl font-semibold">Expense History</h1>
        <span>
          <Link href="/expenses">See all</Link>
        </span>
      </div>
      <div>
        {expenses.map((expense) => (
          <ExpenseItem key={expense.expense_id} expense={expense} />
        ))}
      </div>
    </>
  );
}
