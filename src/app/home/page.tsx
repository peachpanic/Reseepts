import { ExpenseList } from "@/components/homepage/ExpenseList";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function Homepage() {
  return (
    <div className="flex flex-col w-full h-full justify-center items-center">
      <div className="flex flex-col w-full bg-teal-600 py-8 px-4 mb-4 text-white">
        <div className="w-full">Good day, </div>
        <div className="font-bold text-2xl">user!</div>
      </div>

      <Card className="flex flex-col bg-green-200 w-9/10 m-4">
        <CardHeader>
          <CardTitle>Total Balance</CardTitle>
          <CardDescription>
            <h1 className="font-bold text-2xl">P1,234.00</h1>
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="flex flex-col w-full h-full">
        <ExpenseList />
      </div>
    </div>
  );
}
