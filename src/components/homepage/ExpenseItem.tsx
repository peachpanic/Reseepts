import { Expense } from "@/lib/definitions";

export function ExpenseItem({ expense }: { expense: Expense }) {
  return (
    <div className="flex flex-row py-4 px-2 border-black justify-between">
      <div className="flex flex-col">
        <span className="font-medium">{expense.expense_id}</span>
        <span className="text-gray-600 text-sm">
          {expense.expense_date.toLocaleDateString(undefined, {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
      </div>
      <span className="text-red-600 font-bold">{expense.amount}</span>
    </div>
  );
}
