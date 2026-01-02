export function SubscriptionMetricsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Conversion & Churn Section */}
      <div className="bg-gradient-to-br from-info/5 via-info/3 to-info/10 rounded-xl p-6 border border-info/20 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="h-5 bg-gray-200 rounded animate-pulse w-40" />
          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="bg-white/90 backdrop-blur rounded-lg p-4 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="h-3 bg-gray-200 rounded animate-pulse w-24" />
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-8 bg-gray-200 rounded animate-pulse w-16 mb-2" />
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gray-200 rounded-full animate-pulse w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Plan Changes */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="h-5 bg-gray-200 rounded animate-pulse w-32 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                <div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-20 mb-1" />
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
