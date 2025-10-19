"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ExpenseItem from "@/components/expenses/ExpenseItem";

export default function ExpensePage() {
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
        <div className="relative min-h-[300px]"></div>
      </div>
    </div>
  );
}
