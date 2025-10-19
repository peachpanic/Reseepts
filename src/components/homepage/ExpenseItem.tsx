import { Expense } from "@/lib/definitions";

export function ExpenseItem({ expense }: { expense: Expense }) {
  return (
    <div className="flex flex-col py-4 bg-green-200 border-2 border-black">
      <span>{expense.expense_id}</span>
      <span>{expense.amount}</span>
    </div>
  );
}
