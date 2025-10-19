import { Transaction } from "@/lib/definitions";

export default function ExpenseItem({
  expense,
  className,
}: {
  expense: Transaction;
  className?: string;
}) {
  const isGray = className?.includes("bg-gray");

  return (
    <div
      className={`flex flex-row p-2 rounded-md border-black justify-between items-center ${
        className || "bg-teal-700"
      }`}
    >
      <div className="flex flex-col">
        <span className="font-semibold text-black">{expense.description}</span>
        <span className="text-sm text-gray-600">
          {new Date(expense.expense_date).toLocaleDateString("en-PH", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
      </div>
      <span className="font-bold text-red-400">
        -₱{expense.amount.toFixed(2)}
      </span>
    </div>
  );
}
