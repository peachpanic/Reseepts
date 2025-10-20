export default function ExpenseItemSkeleton() {
  return (
    <div className="group mb-3 bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
      <div className="p-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Icon and Details */}
          <div className="flex items-center gap-4 flex-1">
            {/* Icon Container Skeleton */}
            <div className="p-3 bg-gray-200 rounded-lg w-14 h-14"></div>

            {/* Details Skeleton */}
            <div className="flex flex-col gap-2 flex-1">
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-100 rounded w-1/2"></div>
            </div>
          </div>

          {/* Right Section - Amount Skeleton */}
          <div className="flex flex-col items-end gap-2">
            <div className="h-8 bg-gray-200 rounded-lg w-24"></div>
            <div className="h-3 bg-gray-100 rounded w-16"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
