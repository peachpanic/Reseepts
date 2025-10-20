"use client";

import React, { useState } from "react";
import {
  Share2,
  Info,
  ChevronLeft,
  Zap,
  TrendingUp,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { useInsights } from "@/hooks/useInsights";
import { useRouter } from "next/navigation";

const ReseeptsInsightsPage = () => {
  const [activeTab, setActiveTab] = useState("insights");
  const { data, isLoading, isError } = useInsights("1");
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      <div className="flex justify-center relative items-center p-4 font-bold text-white text-2xl bg-[#429690]">
        <button
          onClick={() => router.push("/home")}
          className="flex absolute left-4 items-center gap-2 p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-all active:scale-95 cursor-pointer group"
          aria-label="Go back to home"
        >
          <ArrowLeft
            size={24}
            className="text-white group-hover:text-teal-600 transition-colors"
          />
        </button>
        <h2 className="text-white text-3xl flex-1 text-center">
          Reseepts Insights
        </h2>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 pb-20">
        {/* Featured Insight Card */}
        <div className="bg-gradient-to-b from-teal-800 to-teal-600 border border-teal-500/40 rounded-xl p-6 mb-6 backdrop-blur-sm">
          <div className="flex items-start gap-3 mb-4">
            <Zap className="w-5 h-5 text-teal-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="text-teal-300 font-semibold text-sm">TLDR</h2>
              <p className="text-gray-400 text-xs">Just now</p>
            </div>
          </div>

          <p className="text-white text-base leading-relaxed mb-4">
            {data?.insights.insights_summary}
          </p>

          <div className="space-y-4 mt-6">
            {data?.insights.practical_tips.map(
              (insight: string, index: number) => (
                <div
                  className="pl-4 border-l-2 border-teal-400 flex gap-x-2"
                  key={index}
                >
                  <h3 className="text-white font-semibold text-sm mb-1">
                    {index + 1}
                  </h3>
                  <p className="text-gray-300 text-sm">{insight}</p>
                </div>
              )
            )}
          </div>

          <div className="mt-6 p-3 bg-slate-800/50 rounded-lg border border-teal-900">
            <p className="text-gray-400 text-xs">
              * The information in this report could be inaccurate. Please DYOR.
              Not financial advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReseeptsInsightsPage;
