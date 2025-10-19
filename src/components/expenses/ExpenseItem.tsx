export default function ExpenseItem({
  item,
}: {
  item: {
    id: string;
    category: string;
    name: string;
    date: string;
    amount: number;
  };
}) {
  return (
    <div key={item.id} className="flex justify-between items-center py-2">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
          {item.category[0]}
        </div>
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
