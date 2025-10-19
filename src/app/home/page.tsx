
import ExpenseList from "@/components/homepage/ExpenseList";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Link from "next/link";

export default function Homepage() {
  return (
    <div className="flex flex-col w-full h-full justify-center items-center">
      <div className="w-full">Hello, user!</div>

      <Card className="flex flex-col bg-green-200 w-9/10 m-4">
        <CardHeader>
          <CardTitle>Total Balance</CardTitle>
          <h1 className="font-bold text-2xl">P1,234.00</h1>
          <CardDescription></CardDescription>
        </CardHeader>
      </Card>

      <div className="flex flex-col w-full h-full">
        <ExpenseList />
      </div>
    </div>
  );
}
