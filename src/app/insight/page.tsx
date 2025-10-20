"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TopSpendList } from '@/components/insight/TopSpendList';
import { ChevronLeftIcon, Download } from 'lucide-react';
import { TimePeriodFilter } from '@/components/insight/TimePeriodFilter';
import { useState, useEffect } from 'react';
import { useTransactions, useTopTransactions } from '@/hooks/useTransaction';

export default function InsightPage() {
  const [period, setPeriod] = useState<string>("day")

  useEffect(() => {
    console.log("Selected period: ", period);
  }, [period]);

  const { data: chartTransactions, isLoading: isChartLoading } = useTransactions("1", { period, sortBy: 'date', sortOrder: 'asc' })
  const { data: transactions, isLoading: isTopLoading } = useTopTransactions("1", period, 10);

  const chartData = chartTransactions?.map(transaction => ({
    name: new Date(transaction.expense_date).toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric'
    }),
    amount: transaction.amount,
    category: transaction.category_id
  })) || [];

  return (
    <>
      <AreaChart
        style={{ width: '100%', maxWidth: '700px', maxHeight: '70vh', aspectRatio: 1.618 }}
        responsive
        data={chartData}
        margin={{
          top: 20,
          right: 0,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis width="auto" />
        <Tooltip />
        <Area type="monotone" dataKey="amount" stroke="#8884d8" fill="#8884d8" />
      </AreaChart>

      <div className="flex flex-others items-center justify-between px-4 py-8">
        <ChevronLeftIcon />
        <span className='font-medium text-xl'>Statistics</span>
        <Download />
      </div>

      <TimePeriodFilter value={period} onChange={setPeriod} />
      <TopSpendList transactions={transactions} isLoading={isChartLoading} />
    </>
  );
}