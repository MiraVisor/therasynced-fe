export function SubscriptionStatusSkeleton() {
  return (
    <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-5 bg-gray-200 rounded animate-pulse w-40 mb-1" />
          <div className="h-3 bg-gray-200 rounded animate-pulse w-32" />
        </div>
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
          <div className="h-3 bg-gray-200 rounded animate-pulse w-8" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-6" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { bg: 'bg-success/5', border: 'border-success/20' },
          { bg: 'bg-warning/5', border: 'border-warning/20' },
          { bg: 'bg-error/5', border: 'border-error/20' },
          { bg: 'bg-orange-50', border: 'border-orange-200' },
          { bg: 'bg-red-50', border: 'border-red-200' },
        ].map((style, i) => (
          <div
            key={i}
            className={`group flex flex-col items-center justify-center p-4 ${style.bg} rounded-lg border ${style.border} transition-all cursor-pointer`}
          >
            <div className="h-4 w-4 bg-gray-200 rounded-full mb-2 animate-pulse" />
            <div className="h-6 bg-gray-200 rounded animate-pulse w-8 mb-1" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}
