import SpendChart from "@/components/insight/SpendChart";
import { TopSpendList } from "@/components/insight/TopSpendList";

export default function InsightPage() {
  return (
    <div>
      <div>Insights Page</div>

      <div className="bg-red-200 flex flex-others items-center justify-center">
        Statistics
      </div>

      <SpendChart />
      <TopSpendList />
    </div>
  );
}
