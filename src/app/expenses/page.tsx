export default function ExpensePage() {
    const expenses = [
        { id: '1', category: 'Food', name: 'Groceries', date: '2025-10-01', amount: 120.5 },
        { id: '2', category: 'Rent', name: 'October Rent', date: '2025-10-01', amount: 850.0 },
        { id: '3', category: 'Utilities', name: 'Electricity', date: '2025-10-05', amount: 65.25 },
    ];

    function ExpenseItem({ item }: { item: { id: string; category: string; name: string; date: string; amount: number } }) {
        return (
            <div key={item.id} className="flex justify-between items-center py-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">{item.category[0]}</div>
                    <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.date}</p>
                    </div>
                </div>
                <div>
                    <p className="font-semibold">${item.amount.toFixed(2)}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#429690] min-h-screen">
            <div className="flex justify-around items-center p-4 mb-4">
                <button>{"<"}</button>
                <h2 className="text-white text-lg">Expenses</h2>
                <button>Bell</button>
            </div>
            <div className="bg-white rounded-lg p-4 min-h-screen">
                <div className="mb-4">
                    <label className="text-gray-500">Total Expense</label>
                    <h1 className="text-black text-2xl">$2,548</h1>
                </div>
                <div className="flex flex-col items-center mb-4">
                    <button className="border-2 rounded-full p-2 px-4 text-xl">+</button>
                    <label>Add</label>
                </div>
                <div className="bg-gray-200 flex p-3 gap-3 justify-around mb-4">
                    <button className="bg-white text-gray-500 font-medium w-full">Expenses</button>
                    <button className="bg-white text-gray-500 font-medium w-full">Upcoming Bills</button>
                </div>

                <div className="text-black">
                    {expenses.map((e) => (
                        <ExpenseItem key={e.id} item={e} />
                    ))}
                </div>
            </div>
        </div>
    );
};