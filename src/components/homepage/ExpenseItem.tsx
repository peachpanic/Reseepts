"use client";

import { Transaction } from "@/lib/definitions";
import { ShoppingCart, Calendar, Package, ChevronDown } from "lucide-react";
import { useState } from "react";

export default function ExpenseItem({ expense }: { expense: Transaction }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Convert expense_date to Date object if it's a string
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString(undefined, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const expenseDate = new Date(expense.expense_date).toLocaleDateString(
    "en-PH",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );

  // Check if transaction has items
  const hasItems =
    expense.transaction_items && expense.transaction_items.length > 0;

  return (
    <div className="group mb-3 bg-white rounded-xl border border-gray-200 hover:border-[#429690] transition-all duration-300 hover:shadow-md overflow-hidden">
      {/* Main Transaction Row */}
      <div
        className="p-4 cursor-pointer hover:bg-gradient-to-r hover:from-white hover:to-teal-50/30 transition-all"
        onClick={() => hasItems && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          {/* Left Section - Icon and Details */}
          <div className="flex items-center gap-4 flex-1">
            {/* Icon Container */}
            <div className="p-3 bg-gradient-to-br from-teal-100 to-teal-50 rounded-lg group-hover:from-[#429690]/20 group-hover:to-teal-100/20 transition-all">
              <ShoppingCart
                size={20}
                className="text-[#429690] group-hover:text-[#357a75] transition-colors"
              />
            </div>

            {/* Details */}
            <div className="flex flex-col gap-1 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 group-hover:text-[#429690] transition-colors">
                  {expense.description || `Expense #${expense.expense_id}`}
                </h3>
                {hasItems && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full text-xs font-medium">
                    <Package size={12} />
                    <span>{expense.transaction_items!.length}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                <Calendar size={14} className="text-gray-400" />
                <span>{expenseDate}</span>
              </div>
            </div>
          </div>

          {/* Right Section - Amount and Expand Button */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1.5 bg-red-50 px-3 py-1.5 rounded-lg group-hover:bg-red-100 transition-colors">
                <span className="font-bold text-red-600 text-lg">
                  ₱{Number(expense.amount).toFixed(2)}
                </span>
              </div>
              <span className="text-xs text-gray-400 group-hover:text-gray-500 transition-colors capitalize">
                {expense.payment_method || "Expense"}
              </span>
            </div>

            {/* Expand/Collapse Icon */}
            {hasItems && (
              <ChevronDown
                size={20}
                className={`text-gray-400 transition-transform duration-300 ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            )}
          </div>
        </div>

        {/* Bottom Accent Bar */}
        <div className="mt-3 h-0.5 bg-gradient-to-r from-transparent via-[#429690]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>

      {/* Expandable Transaction Items Section */}
      {hasItems && (
        <div
          className={`border-t border-gray-200 bg-gray-50 transition-all duration-300 overflow-hidden ${
            isExpanded ? "max-h-96 overflow-y-auto" : "max-h-0"
          }`}
        >
          <div className="p-4 space-y-2">
            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
              Transaction Items
            </h4>
            {expense.transaction_items!.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-start p-3 bg-white rounded-lg border border-gray-200 hover:border-teal-300 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {item.item_name || "Unnamed item"}
                  </div>
                  {item.subcategory && (
                    <div className="text-xs text-gray-500 mt-1">
                      {item.subcategory}
                    </div>
                  )}
                </div>
                <div className="font-semibold text-[#429690] ml-4">
                  ₱{Number(item.amount).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
