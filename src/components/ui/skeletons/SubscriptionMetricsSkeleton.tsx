export function SubscriptionMetricsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="group flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse mb-2" />
            <div className="h-8 bg-gray-200 rounded animate-pulse w-12 mb-1" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
          </div>
        ))}
      </div>

      {/* Revenue Section */}
      <div className="bg-gradient-to-br from-primary/5 via-primary/3 to-primary/10 rounded-xl p-6 border border-primary/20 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="h-5 bg-gray-200 rounded animate-pulse w-32" />
          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="bg-white/90 backdrop-blur rounded-lg p-4 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="h-3 bg-gray-200 rounded animate-pulse w-16" />
                <div className="h-2 w-2 bg-gray-200 rounded-full animate-pulse" />
              </div>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-24 mb-1" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-20" />
            </div>
          ))}
        </div>
      </div>

      {/* Conversion & Churn Section */}
      <div className="bg-gradient-to-br from-info/5 via-info/3 to-info/10 rounded-xl p-6 border border-info/20 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="h-5 bg-gray-200 rounded animate-pulse w-40" />
          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="bg-white/90 backdrop-blur rounded-lg p-4 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="h-3 bg-gray-200 rounded animate-pulse w-24" />
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-8 bg-gray-200 rounded animate-pulse w-16" />
            </div>
          ))}
        </div>
      </div>

      {/* Plan Changes */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="h-5 bg-gray-200 rounded animate-pulse w-32 mb-4" />
        <div className="grid grid-cols-2 gap-3">
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
