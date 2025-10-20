import ExpenseItem from "@/components/homepage/ExpenseItem";
import ExpenseListSkeleton from "@/components/homepage/Skeleton/ExpenseListSkeleton";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Transaction } from "@/lib/definitions";

type TopSpendProps = {
  transactions?: Transaction[]
  isLoading: boolean
}

export function TopSpendList({ transactions, isLoading }: TopSpendProps) {
  if (isLoading) {
    return (
      <>
        <ExpenseListSkeleton count={10}/>
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
      <div className="mx-4">
        {transactions?.map((transaction) => (
          <ExpenseItem key={transaction.expense_id} expense={transaction} />
        ))}
      </div>
    </>
  );
}
