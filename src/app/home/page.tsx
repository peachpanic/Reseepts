"use client";

import ExpenseList from "@/components/homepage/ExpenseList";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { useState } from "react";

export default function Homepage() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="flex flex-col w-full h-full bg-gradient-to-b from-teal-600 to-teal-700">
      {/* Top Section - with relative positioning and extra padding for card */}
      <div className="relative flex flex-col w-full py-8 px-6 pb-24 text-white">
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1">
            <p className="text-teal-100 text-sm font-medium">Welcome back</p>
            <h1 className="font-bold text-3xl mt-1">Good day, user!</h1>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-teal-600 rounded-full font-semibold hover:bg-teal-50 transition-all shadow-lg hover:shadow-xl cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-95"
          >
            {isLoggingOut ? (
              <>
                <div className="animate-spin">
                  <LogOut size={18} />
                </div>
                <span className="text-sm">Logging out...</span>
              </>
            ) : (
              <>
                <LogOut size={18} />
                <span className="text-sm">Logout</span>
              </>
            )}
          </button>
        </div>

        {/* Card positioned absolutely to overlap */}
        <Card className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 flex flex-col bg-gradient-to-r from-teal-700 to-teal-800 w-[90%] shadow-2xl border-0 rounded-2xl">
          <CardHeader className="text-white py-6">
            <CardTitle className="text-teal-100 font-medium text-sm mb-2">
              Total Balance
            </CardTitle>
            <h1 className="font-bold text-4xl text-white">P1,234.00</h1>
            <CardDescription></CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* White Section - with top padding to account for overlapping card */}
      <div className="flex flex-col w-full h-full bg-gray-50 rounded-t-3xl pt-20 shadow-2xl">
        <div className="flex flex-col w-full h-full px-4">
          <ExpenseList />
        </div>
      </div>
    </div>
  );
}
