import { ExpenseList } from "@/components/homepage/ExpenseList";

export default function Homepage() {
  return (
    <div className="flex flex-col w-full h-full justify-center items-center">
      <div className="flex flex-col bg-green-200 w-full">
        <span>Total Balance</span>
        <span>P1,234.00</span>
      </div>

      <div className="flex flex-col w-full h-full">
        <h1 className="text-2xl font-semibold">Expense History</h1>
        <ExpenseList />
      </div>
    </div>
  );
}
