"use client";

import { useTopTransactions } from "@/hooks/useTopTransaction";
import { useSession } from "next-auth/react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 relative">
        <div className="absolute -bottom-2 left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
        <p className="text-sm font-medium">{`Amount: ₱${payload[0].value.toFixed(
          2
        )}`}</p>
      </div>
    );
  }
  return null;
};

const SpendChart = (period: string) => {
  const { data: session, status } = useSession();

  const { data: expenses, isLoading } = useTopTransactions("1", period);

  const transformData =
    expenses?.map((expense) => ({
      name: new Date(expense.expense_date).toLocaleDateString("en-US", {
        weekday: "short",
      }),
      uv: expense.amount,
      // pv: expense.amount,
    })) || [];

  return (
    <>
      <div className="px-4">
        <h4 className="text-xl font-semibold">Expenses</h4>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart
          data={transformData}
          margin={{ top: -50, right: 20, left: -40, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="3%" stopColor="#14b8a6" stopOpacity={0.4} />
              <stop offset="97%" stopColor="#0f766e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="name" />
          <YAxis axisLine={false} tickLine={false} tick={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="uv"
            stroke="#14b8a6"
            fillOpacity={1}
            fill="url(#colorUv)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </>
  );
};

export default SpendChart;
