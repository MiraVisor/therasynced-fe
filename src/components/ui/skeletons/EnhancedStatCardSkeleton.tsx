export function EnhancedStatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm shadow-soft p-6 space-y-4">
      {/* Header with title and icon skeleton */}
      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
          <div className="h-8 bg-gray-200 rounded animate-pulse w-16" />
        </div>
        <div className="h-10 w-10 bg-gray-200 rounded-2xl animate-pulse" />
      </div>

      {/* Sparkline skeleton */}
      <div className="pt-2">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-full" />
      </div>
    </div>
  );
}
