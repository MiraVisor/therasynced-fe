export function LoyaltySectionSkeleton() {
  return (
    <div className="space-y-6">
      {/* Points & Tier Overview */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-6">
          <div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mb-1" />
            <div className="h-10 bg-gray-200 rounded animate-pulse w-32" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
            <div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-20 mb-1" />
              <div className="h-5 bg-gray-200 rounded animate-pulse w-16" />
            </div>
          </div>
        </div>

        {/* Progress to Next Tier */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-28" />
          </div>
          <div className="h-2 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Tier Benefits */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mb-3" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-6 bg-gray-200 rounded animate-pulse w-20" />
            ))}
          </div>
        </div>
      </div>

      {/* Rewards & History Tabs */}
      <div className="w-full">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
          <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse" />
          <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Rewards Tab Content */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-32" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-48" />
                  </div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-16 ml-2" />
                </div>
                <div className="h-10 bg-gray-200 rounded animate-pulse w-full mt-4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
