export function PlansOverviewSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-5 bg-gray-200 rounded animate-pulse w-48 mb-1" />
          <div className="h-3 bg-gray-200 rounded animate-pulse w-40" />
        </div>
        <div className="h-8 bg-gray-200 rounded animate-pulse w-24" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { bg: 'from-primary/10 to-primary/5', border: 'border-primary/20' },
          { bg: 'from-info/10 to-info/5', border: 'border-info/20' },
          { bg: 'from-success/10 to-success/5', border: 'border-success/20' },
        ].map((style, i) => (
          <div
            key={i}
            className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${style.bg} p-6 border ${style.border} hover:shadow-lg transition-all cursor-pointer`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-200/20 rounded-full -mr-16 -mt-16 animate-pulse" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-gray-200 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
                </div>
                <div className="h-5 bg-gray-200 rounded animate-pulse w-12" />
              </div>
              <div className="h-12 bg-gray-200 rounded animate-pulse w-16 mb-3" />
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-16" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-8" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
