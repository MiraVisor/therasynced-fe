export function ChartsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="h-5 bg-gray-200 rounded animate-pulse w-40 mb-4" />
        <div className="h-[350px] w-full bg-gray-50 rounded animate-pulse" />
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="h-5 bg-gray-200 rounded animate-pulse w-48 mb-4" />
        <div className="h-[350px] w-full bg-gray-50 rounded animate-pulse" />
      </div>
    </div>
  );
}
