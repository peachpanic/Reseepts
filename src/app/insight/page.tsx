"use client";

import SpendChart from "@/components/insight/SpendChart";
import { TimePeriodFilter } from "@/components/insight/TimePeriodFilter";
import { TopSpendList } from "@/components/insight/TopSpendList";
import { ChevronLeftIcon, Download, Sparkle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function InsightPage() {
  const [period, setPeriod] = useState<string>("day");

  useEffect(() => {
    console.log("Selected period: ", period);
  }, [period]);

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
        <TopSpendList period={period} />
      </div>
    </>
  );
}
