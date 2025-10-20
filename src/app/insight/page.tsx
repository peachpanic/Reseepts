"use client";

// import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TopSpendList } from "@/components/insight/TopSpendList";
import { ChevronLeftIcon, Download, Sparkle } from "lucide-react";
import { TimePeriodFilter } from "@/components/insight/TimePeriodFilter";
import { useState, useEffect } from "react";
import { useTransactions, useTopTransactions } from "@/hooks/useTransaction";
import SpendChart from "@/components/insight/SpendChart";
import Link from "next/link";

// export default function InsightPage() {
//   const [period, setPeriod] = useState<string>("day");

//   useEffect(() => {
//     console.log("Selected period: ", period);
//   }, [period]);

//   const { data: chartTransactions, isLoading: isChartLoading } = useTransactions("1", { period, sortBy: 'date', sortOrder: 'asc' })
//   const { data: transactions, isLoading: isTopLoading } = useTopTransactions("1", period, 10);

//   const chartData = chartTransactions?.map(transaction => ({
//     name: new Date(transaction.expense_date).toLocaleDateString('en-PH', {
//       month: 'short',
//       day: 'numeric'
//     }),
//     amount: transaction.amount,
//     category: transaction.category_id
//   })) || [];

//   return (
//     <>
//       <div className="flex flex-others items-center justify-between px-4 py-4">
//         <ChevronLeftIcon />
//         <span className="font-medium text-xl">Insights</span>
//         <Sparkle className="text-teal-700" />{" "}
//       </div>
//       <div className="space-y-4">
//         <TimePeriodFilter value={period} onChange={setPeriod} />
//         <SpendChart period={period} />
//         <TopSpendList period={period} />
//       </div>

//       <TimePeriodFilter value={period} onChange={setPeriod} />
//       <TopSpendList transactions={transactions} isLoading={isChartLoading} />
//     </>
//   );
// }

export default function InsightPage() {
  const [period, setPeriod] = useState<string>("day");

  useEffect(() => {
    console.log("Selected period: ", period);
  }, [period]);

  const { data: chartTransactions, isLoading: isChartLoading } =
    useTransactions("1", { period, sortBy: "date", sortOrder: "asc" });

  const { data: transactions, isLoading: isTopLoading } = useTopTransactions(
    "1",
    period,
    10
  );

  const chartData =
    chartTransactions?.map((transaction) => ({
      name: new Date(transaction.expense_date).toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
      }),
      amount: transaction.amount,
      category: transaction.category_id,
    })) || [];

  return (
    <>
      <div className="flex flex-others items-center justify-between px-4 py-4">
        <ChevronLeftIcon />
        <span className="font-medium text-xl">Insights</span>
        <Link href="/reseepts-insights">
          <Sparkle className="text-teal-700" />{" "}
        </Link>
      </div>

      <div className="space-y-4">
        <TimePeriodFilter value={period} onChange={setPeriod} />
        <SpendChart period={period} />
        <TopSpendList
          transactions={transactions ?? []}
          isLoading={isTopLoading}
        />
      </div>
    </>
  );
}
