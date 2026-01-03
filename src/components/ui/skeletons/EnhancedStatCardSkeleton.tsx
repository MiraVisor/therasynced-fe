export function EnhancedStatCardSkeleton({
  bookingSkeleton = false,
  hasSparkline = true,
  simple = false,
}: {
  bookingSkeleton?: boolean;
  hasSparkline?: boolean;
  simple?: boolean;
}) {
  // Simple skeleton for cards with just title and value (no trend, no sparkline)
  if (simple) {
    return (
      <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm shadow-soft p-6 space-y-3 h-[100px]">
        {/* Header with title */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
          <div className="h-8 bg-gray-200 rounded animate-pulse w-24" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm shadow-soft p-6 space-y-4
        ${bookingSkeleton ? 'h-[140px]' : hasSparkline ? 'h-[170px]' : 'h-[120px]'}`}
    >
      {/* Header with title */}
      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
          <div className="flex items-baseline gap-2">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-16" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-8" />
          </div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-20 mt-1" />
        </div>
      </div>

      {/* Sparkline chart skeleton */}
      {hasSparkline && (
        <div className="pt-7">
          <div className="h-3 bg-gray-200 rounded animate-pulse w-full" />
        </div>
      )}
    </div>
  );
}
