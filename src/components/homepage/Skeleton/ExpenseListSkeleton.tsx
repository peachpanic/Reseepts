
export default function ExpenseListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="p-4 space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-6 w-40 rounded bg-gray-200 animate-pulse" />
        <div className="flex gap-2">
          <div className="h-8 w-20 rounded bg-gray-200 animate-pulse hidden sm:block" />
          <div className="h-8 w-20 rounded bg-gray-200 animate-pulse" />
        </div>
      </div>

      {/* List skeletons */}
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-4 p-3 rounded-lg bg-white shadow-sm"
          >
            <div className="flex-1 min-w-0">
              <div className="h-4 w-32 rounded bg-gray-200 animate-pulse mb-2 sm:w-48" />
              <div className="h-3 w-28 rounded bg-gray-100 animate-pulse sm:w-40" />
            </div>

            <div className="w-24 flex-shrink-0">
              <div className="h-6 w-full rounded bg-gray-200 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}