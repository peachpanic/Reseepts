import { Transaction } from "@/lib/definitions";
import { ShoppingCart, Calendar, Package } from "lucide-react";

export default function ExpenseItem({ expense }: { expense: Transaction }) {
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
    expense.transaction_item && expense.transaction_item.length > 0;

  return (
    <div className="group mb-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-[#429690] transition-all duration-300 hover:shadow-md cursor-pointer hover:bg-gradient-to-r hover:from-white hover:to-teal-50/30">
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
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold text-gray-900 group-hover:text-[#429690] transition-colors">
              {expense.description || `Expense #${expense.expense_id}`}
            </h3>
            <div className="flex items-center gap-1.5 text-gray-500 text-sm">
              <Calendar size={14} className="text-gray-400" />
              <span>{expenseDate}</span>
            </div>
            {hasItems && (
              <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-0.5">
                <Package size={12} className="text-gray-400" />
                <span>
                  {expense.transaction_item!.length} item
                  {expense.transaction_item!.length > 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Amount */}
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
      </div>

      {/* Transaction Items List */}
      {hasItems && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="space-y-1">
            {expense.transaction_item!.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-xs text-gray-600 py-1 px-2 rounded hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-[#429690] rounded-full"></div>
                  <span className="font-medium">
                    {item.item_name || "Unnamed item"}
                  </span>
                  {item.subcategory && (
                    <span className="text-gray-400 text-xs">
                      ({item.subcategory})
                    </span>
                  )}
                </div>
                <span className="text-gray-500">
                  ₱{Number(item.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Accent Bar */}
      <div className="mt-3 h-0.5 bg-gradient-to-r from-transparent via-[#429690]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </div>
  );
}
