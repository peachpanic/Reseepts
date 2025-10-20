"use client";

import React, { useState } from "react";
import {
  Share2,
  Info,
  ChevronLeft,
  Zap,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

const ReseeptsInsightsPage = () => {
  const [activeTab, setActiveTab] = useState("insights");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-900 border-b border-teal-500/20 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChevronLeft className="w-6 h-6 text-teal-400 cursor-pointer" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">RI</span>
              </div>
              <h1 className="text-white text-xl font-bold">
                Reseepts Insights
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Share2 className="w-5 h-5 text-teal-400 cursor-pointer" />
            <Info className="w-5 h-5 text-teal-400 cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 pb-20">
        {/* Featured Insight Card */}
        <div className="bg-gradient-to-br from-teal-900/40 to-teal-800/20 border border-teal-500/40 rounded-xl p-6 mb-6 backdrop-blur-sm">
          <div className="flex items-start gap-3 mb-4">
            <Zap className="w-5 h-5 text-teal-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="text-teal-300 font-semibold text-sm">TLDR</h2>
              <p className="text-gray-400 text-xs">Updated 6 h ago</p>
            </div>
          </div>

          <p className="text-white text-base leading-relaxed mb-4">
            Bitcoin has experienced a 1.63% price increase over the last 24
            hours, reaching 108624.18 USDT, fueled by strong technical momentum
            and positive institutional developments, indicating key factors.
          </p>

          <div className="space-y-4 mt-6">
            <div className="pl-4 border-l-2 border-teal-400">
              <h3 className="text-white font-semibold text-sm mb-1">
                1. Technical Momentum
              </h3>
              <p className="text-gray-300 text-sm">
                Price has broken out above Bollinger Bands with strong MACD and
                high volume, indicating bullish technical momentum, though RSI
                suggests overbought conditions.
              </p>
            </div>

            <div className="pl-4 border-l-2 border-teal-400">
              <h3 className="text-white font-semibold text-sm mb-1">
                2. Evolving Utility
              </h3>
              <p className="text-gray-300 text-sm">
                Institutional interest is growing for Bitcoin's yield and DeFi
                capabilities, supported by a significant Core software update
                and positive regulatory news from Japan.
              </p>
            </div>

            <div className="pl-4 border-l-2 border-teal-400">
              <h3 className="text-white font-semibold text-sm mb-1">
                3. Whale Activity
              </h3>
              <p className="text-gray-300 text-sm">
                A major whale has increased its Bitcoin long position, signaling
                strong confidence, despite some recent short-term outflows.
              </p>
            </div>
          </div>

          <div className="mt-6 p-3 bg-slate-800/50 rounded-lg border border-teal-500/20">
            <p className="text-gray-400 text-xs">
              * The information in this report could be inaccurate. Please DYOR.
              Not financial advice.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-700">
          {["insights", "analysis", "signals"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                activeTab === tab
                  ? "text-teal-400 border-teal-400"
                  : "text-gray-500 border-transparent hover:text-gray-300"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Positives Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-teal-400" />
            <h3 className="text-white text-lg font-bold">Positives</h3>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-800/50 border border-teal-500/20 rounded-lg p-4 hover:border-teal-500/40 transition-colors">
              <div className="flex gap-3">
                <span className="text-teal-400 font-bold flex-shrink-0">
                  1.
                </span>
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-2">
                    Technical Breakout
                  </h4>
                  <p className="text-gray-300 text-sm">
                    BTC price has surged to 108624.18 USDT, breaking above its
                    Bollinger Bands upper limit. This upward movement is
                    reinforced by strong bullish MACD momentum and rising
                    volume, indicating a significant breakout.
                  </p>
                  <span className="text-teal-400 text-xs mt-2 inline-block cursor-pointer hover:text-teal-300">
                    📊 1 chart
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-teal-500/20 rounded-lg p-4 hover:border-teal-500/40 transition-colors">
              <div className="flex gap-3">
                <span className="text-teal-400 font-bold flex-shrink-0">
                  2.
                </span>
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-2">
                    Institutional Adoption & Innovation
                  </h4>
                  <p className="text-gray-300 text-sm">
                    Institutional demand is accelerating with major financial
                    entities integrating Bitcoin into their portfolios and
                    developing new products around Bitcoin's yield and DeFi
                    capabilities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Negatives Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <h3 className="text-white text-lg font-bold">Negatives</h3>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-800/50 border border-red-500/20 rounded-lg p-4 hover:border-red-500/40 transition-colors">
              <div className="flex gap-3">
                <span className="text-red-400 font-bold flex-shrink-0">1.</span>
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-2">
                    Overbought Conditions
                  </h4>
                  <p className="text-gray-300 text-sm">
                    RSI indicators suggest Bitcoin is currently in overbought
                    territory, which could indicate potential pullback or
                    consolidation in the near term.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReseeptsInsightsPage;
