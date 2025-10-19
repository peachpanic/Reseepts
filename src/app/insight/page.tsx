import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { ArrowDownUp } from 'lucide-react';
import { TopSpendItem } from '@/components/insight/TopSpendItem';
import { TopSpendList } from '@/components/insight/TopSpendList';

export default function InsightPage() {

  return (
    <>
      <div>
        Insights Page
      </div>

      <div className="bg-red-200 flex flex-others items-center justify-center">
        Statistics
      </div>

      <TopSpendList />

    </>
  );
}