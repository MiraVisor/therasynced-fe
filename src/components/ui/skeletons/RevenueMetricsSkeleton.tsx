export function RevenueMetricsSkeleton() {
  return (
    <div className="bg-gradient-to-br from-primary/5 via-primary/3 to-primary/10 rounded-xl p-6 border border-primary/20 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
          <div className="h-5 bg-gray-200 rounded animate-pulse w-32" />
        </div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white/90 backdrop-blur rounded-lg p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="h-3 bg-gray-200 rounded animate-pulse w-8" />
              <div className="h-2 w-2 bg-gray-200 rounded-full animate-pulse" />
            </div>
            <div className="h-6 bg-gray-200 rounded animate-pulse w-16 mb-1" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}
