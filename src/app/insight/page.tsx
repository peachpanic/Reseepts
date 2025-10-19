import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { ArrowDownUp } from 'lucide-react';
import { TopSpendItem } from '@/components/insight/TopSpendItem';
import { TopSpendList } from '@/components/insight/TopSpendList';

export default function InsightPage() {
  const data = [
    {'test'}
  ]; // Dummy data for the AreaChart
  return (
    <>
      <div>
        Insights Page
      </div>

      <div className="bg-red-200 flex flex-others items-center justify-center">
        Statistics
      </div>
      
      <div>
        <AreaChart style={{ width: '100%', maxWidth: '700px', maxHeight: '70vh', aspectRatio: 1.618 }}
      responsive
      data={data}
      margin={{
        top: 20,
        right: 0,
        left: 0,
        bottom: 0,
      }}></AreaChart>
      </div>

      <TopSpendList />

    </>
  );