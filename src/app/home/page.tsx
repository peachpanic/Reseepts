"use client";

import ExpenseList from "@/components/homepage/ExpenseList";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useSession } from "next-auth/react";

export default function Homepage() {
  const { data: session } = useSession();
  return (
    <div className="flex flex-col w-full h-full bg-teal-600">
      {/* Top Section - with relative positioning and extra padding for card */}
      <div className="relative flex flex-col w-full py-8 px-4 pb-20 text-white">
        <div className="w-full">Good day, </div>
        <div className="font-bold text-2xl">{session?.user?.name}</div>

        {/* Card positioned absolutely to overlap */}
        {/* absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2  */}
        <Card className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 flex flex-col bg-teal-700 w-[90%] shadow-lg border-0">
          <CardHeader className="text-white">
            <CardTitle>Total Expense</CardTitle>
            <h1 className="font-bold text-3xl">P1,234.00</h1>{" "}
            {/* total balance here */}
            <CardDescription></CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* White Section - with top padding to account for overlapping card */}
      <div className="flex flex-col w-full h-full bg-white rounded-t-2xl pt-16">
        <div className="flex flex-col w-full h-full">
          <ExpenseList />
        </div>
      </div>
    </div>
  );
}
