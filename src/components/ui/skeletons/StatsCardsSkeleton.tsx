interface StatsCardsSkeletonProps {
  count?: number;
  className?: string;
}

export const StatsCardsSkeleton = ({ count = 4, className }: StatsCardsSkeletonProps) => {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 ${className || ''}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="p-6 bg-card border border-gray-200/80 rounded-xl shadow-soft space-y-4 overflow-hidden relative"
        >
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gray-200 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-2/3" />
              <div className="h-6 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
