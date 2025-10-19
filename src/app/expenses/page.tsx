"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ExpenseItem from "@/components/expenses/ExpenseItem";

export default function ExpensePage() {
  const [activeTab, setActiveTab] = useState<"expenses" | "bills">("expenses");
  const [screen, setScreen] = useState<"main" | "upload">("main");

  const expenses = [
    {
      id: "1",
      category: "Food",
      name: "Groceries",
      date: "2025-10-01",
      amount: 120.5,
    },
    {
      id: "2",
      category: "Rent",
      name: "October Rent",
      date: "2025-10-01",
      amount: 850.0,
    },
    {
      id: "3",
      category: "Utilities",
      name: "Electricity",
      date: "2025-10-05",
      amount: 65.25,
    },
  ];

  const bills = [
    {
      id: "b1",
      category: "Subscription",
      name: "Netflix",
      date: "2025-10-10",
      amount: 15.99,
    },
    {
      id: "b2",
      category: "Loan",
      name: "Car Loan",
      date: "2025-10-15",
      amount: 250.0,
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#429690]">
      <div className="flex justify-around items-center p-4 mb-4 font-bold text-white text-2xl">
        <button>
          <i className="bx bx-chevron-left"></i>{" "}
        </button>
        <h2 className="text-white text-lg">Expenses</h2>
        <button>
          <i className="bx bx-bell"></i>{" "}
        </button>
      </div>
      {/* Main Content */}
      <div className="bg-white rounded-lg p-4 min-h-screen">
        <div className="relative min-h-[300px]">
          <AnimatePresence mode="wait">
            {screen === "main" && (
              <motion.div
                key="main"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <div className="mb-4 flex flex-col items-center">
                  <label className="text-gray-500">Total Expense</label>
                  <h1 className="text-black text-4xl font-bold">$2,548</h1>
                </div>
                <div className="flex flex-col items-center mb-4 text-[#549994] font-bold">
                  <button
                    className="border-2 rounded-full p-2 px-4 text-xl focus:outline-none"
                    onClick={() => setScreen("upload")}
                  >
                    +
                  </button>
                  <label>Add</label>
                </div>
                <div className="bg-gray-200 flex p-2 gap-1 justify-around mb-4 rounded-xl">
                  <button
                    className={`w-full rounded-lg font-medium ${
                      activeTab === "expenses"
                        ? "bg-white text-gray-900"
                        : "bg-gray-200 text-gray-500"
                    }`}
                    onClick={() => setActiveTab("expenses")}
                  >
                    Expenses
                  </button>
                  <button
                    className={`w-full rounded-lg font-medium ${
                      activeTab === "bills"
                        ? "bg-white text-gray-900"
                        : "bg-gray-200 text-gray-500"
                    }`}
                    onClick={() => setActiveTab("bills")}
                  >
                    Upcoming Bills
                  </button>
                </div>
                <div className="text-black">
                  {(activeTab === "expenses" ? expenses : bills).map((e) => (
                    <ExpenseItem key={e.id} item={e} />
                  ))}
                </div>
                {/* Removed Go to Upload Receipt button; Add button now triggers upload screen */}
              </motion.div>
            )}

            {screen === "upload" && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
                className="w-full flex flex-col items-center justify-center bg-white"
              >
                <h2 className="text-xl font-semibold mb-4">Upload Receipt</h2>
                <div className="bg-yellow-300 rounded-lg p-4 mb-6"></div>
                <button
                  className="border rounded-full px-8 py-2 text-[#429690] font-semibold mb-4"
                  onClick={() => setScreen("main")}
                >
                  Scan Receipt
                </button>
                <button
                  className="border rounded-full px-8 py-2 text-[#429690] font-semibold"
                  onClick={() => setScreen("main")}
                >
                  Cancel
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
