import ExpenseItem from "@/components/expenses/ExpenseItem";

export default function ExpensePage() {
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

  return (
    <div className="bg-[#429690] min-h-screen">
      <div className="flex justify-around items-center p-4 mb-4 font-bold text-white text-2xl">
        <button>
          <i class="bx  bx-chevron-left"></i>{" "}
        </button>
        <h2 className="text-white text-lg">Expenses</h2>
        <button>
          <i class="bx  bx-bell"></i>{" "}
        </button>
      </div>
      <div className="bg-white rounded-lg p-4 min-h-screen">
        <div className="mb-4 flex flex-col items-center">
          <label className="text-gray-500">Total Expense</label>
          <h1 className="text-black text-4xl font-bold">$2,548</h1>
        </div>
        <div className="flex flex-col items-center mb-4 text-[#549994] font-bold">
          <button className="border-2 rounded-full p-2 px-4 text-xl">+</button>
          <label>Add</label>
        </div>
        <div className="bg-gray-200 flex p-2 gap-1 justify-around mb-4 rounded-xl">
          <button className="bg-white text-gray-500 font-medium w-full rounded-lg">
            Expenses
          </button>
          <button className="bg-white text-gray-500 font-medium w-full bg-white text-gray-500 font-medium w-full rounded-lg">
            Upcoming Bills
          </button>
        </div>

        <div className="text-black">
          {expenses.map((e) => (
            <ExpenseItem key={e.id} item={e} />
          ))}
        </div>
      </div>
    </div>
  );
}
