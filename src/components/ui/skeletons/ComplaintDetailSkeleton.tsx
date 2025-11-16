export function ComplaintDetailSkeleton() {
  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Status and Actions Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-8 bg-gray-200 rounded-full animate-pulse w-24" />
          <div className="h-6 bg-gray-200 rounded animate-pulse w-32" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 bg-gray-200 rounded animate-pulse w-32" />
          <div className="h-10 bg-gray-200 rounded animate-pulse w-32" />
        </div>
      </div>

      {/* User Profiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-48" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded animate-pulse w-24" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-40" />
            </div>
          </div>
        ))}
      </div>

      {/* Complaint Details Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-48 mb-6" />

        <div className="space-y-6">
          {/* Reason */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
            <div className="h-5 bg-gray-200 rounded animate-pulse w-64" />
          </div>

          {/* Separator */}
          <div className="h-px bg-gray-200" />

          {/* Description */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
            </div>
          </div>

          {/* Evidence */}
          <div className="h-px bg-gray-200" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="aspect-video bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-40 mb-6" />

        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="h-3 w-3 bg-gray-200 rounded-full animate-pulse" />
                {i < 1 && <div className="h-8 w-px bg-gray-200 mt-2" />}
              </div>
              <div className="flex-1 space-y-2 pb-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-48" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-32" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
