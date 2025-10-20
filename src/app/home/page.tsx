"use client";

import ExpenseList from "@/components/homepage/ExpenseList";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { LogOut, TrendingUp } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function Homepage() {
  const { data: session, status } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [totalBalance, setTotalBalance] = useState<number>(0);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await fetch("/api/expenses?id=1");
        if (res.ok) {
          const data = await res.json();
          const transactions = data.transactions || [];
          const total = transactions.reduce(
            (sum: number, t: any) => sum + Number(t.amount),
            0
          );
          setTotalBalance(total);
        }
      } catch (err) {
        console.error("Failed to fetch balance:", err);
      }
    };
    fetchBalance();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="flex flex-col w-full h-full bg-gradient-to-b from-[#429690] via-[#3a8078] to-[#2d6a63]">
      {/* Top Section - with relative positioning and extra padding for card */}
      <div className="relative flex flex-col w-full py-8 px-6 pb-32 text-white">
        {/* Header with Welcome and Logout */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex-1 pr-4">
            <p className="text-white/70 text-sm font-medium tracking-wide mb-1">
              Welcome back
            </p>
            <h1 className="font-bold text-2xl mt-2 leading-tight">
              Good day,{" "}
              <span className="bg-gradient-to-r from-white to-teal-100 bg-clip-text text-transparent">
                {session?.user?.name}
              </span>
            </h1>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/95 text-[#429690] rounded-full font-semibold text-sm hover:bg-white transition-all shadow-lg hover:shadow-xl cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 hover:scale-105 backdrop-blur-sm border border-white/20"
          >
            {isLoggingOut ? (
              <>
                <div className="animate-spin">
                  <LogOut size={18} />
                </div>
                <span>Logging out...</span>
              </>
            ) : (
              <>
                <LogOut size={18} />
                <span>Logout</span>
              </>
            )}
          </button>
        </div>

        {/* Balance Card - Improved */}
        <Card className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 flex flex-col bg-gradient-to-br from-white to-gray-50 w-[90%] max-w-md shadow-2xl border-0 rounded-3xl overflow-hidden hover:shadow-3xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#429690]/10 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-teal-400/5 to-transparent rounded-full blur-2xl"></div>

          <CardHeader className="py-8 px-8 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-[#429690]/70 font-medium text-sm tracking-wide">
                Total Balance
              </CardTitle>
              <div className="p-2.5 bg-gradient-to-br from-[#429690]/20 to-transparent rounded-full">
                <TrendingUp size={18} className="text-[#429690]" />
              </div>
            </div>
            <h1 className="font-bold text-5xl text-gray-900 tracking-tight">
              ₱{totalBalance.toFixed(2)}
            </h1>
            <p className="text-[#429690]/60 text-xs font-medium mt-3">
              Total expenses tracked
            </p>
            <CardDescription></CardDescription>
          </CardHeader>

          {/* Card Bottom Accent */}
          <div className="h-1 bg-gradient-to-r from-transparent via-[#429690] to-transparent"></div>
        </Card>
      </div>

      {/* White Section - with top padding to account for overlapping card */}
      <div className="flex flex-col w-full flex-1 bg-white rounded-t-3xl pt-24 shadow-2xl overflow-hidden">
        <div className="flex flex-col w-full h-full px-6">
          {/* Section Title */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Recent Expenses
            </h2>
            <div className="h-1 w-12 bg-gradient-to-r from-[#429690] to-teal-400 rounded-full mt-3"></div>
          </div>

          {/* Expense List */}
          <div className="flex-1 overflow-y-auto">
            <ExpenseList />
          </div>
        </div>

        {/* Bottom Safe Area */}
        <div className="h-6"></div>
      </div>
    </div>
  );
}
