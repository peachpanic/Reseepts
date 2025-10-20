import { ShoppingCart, Calendar, DollarSign } from "lucide-react";

export default function ExpenseItem({ item }: { item: any }) {
  const expenseDate = new Date(item.expense_date).toLocaleDateString("en-PH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

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
              {item.description || `Expense #${item.expense_id}`}
            </h3>
            <div className="flex items-center gap-1.5 text-gray-500 text-sm">
              <Calendar size={14} className="text-gray-400" />
              <span>{expenseDate}</span>
            </div>
          </div>
        </div>

        {/* Right Section - Amount */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1.5 bg-red-50 px-3 py-1.5 rounded-lg group-hover:bg-red-100 transition-colors">
            <span className="font-bold text-red-600 text-lg">
              ₱{Number(item.amount).toFixed(2)}
            </span>
          </div>
          <span className="text-xs text-gray-400 group-hover:text-gray-500 transition-colors">
            {item.payment_method || "Expense"}
          </span>
        </div>
      </div>

      {/* Bottom Accent Bar */}
      <div className="mt-3 h-0.5 bg-gradient-to-r from-transparent via-[#429690]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </div>
  );
}
