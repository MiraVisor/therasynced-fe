export function AccountSectionSkeleton() {
  return (
    <div className="space-y-8">
      {/* Email Management */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="h-5 bg-gray-200 rounded animate-pulse w-32 mb-6" />
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
            <div className="h-11 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-11 bg-gray-200 rounded animate-pulse w-32" />
        </div>
      </div>

      {/* Password Management */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="h-5 bg-gray-200 rounded animate-pulse w-40 mb-6" />

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-28" />
                <div className="h-11 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-36" />
            <div className="h-11 bg-gray-200 rounded animate-pulse" />
          </div>

          <div className="h-11 bg-gray-200 rounded animate-pulse w-36" />
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white border border-red-200 rounded-xl p-6">
        <div className="h-5 bg-red-200 rounded animate-pulse w-24 mb-4" />
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <div className="h-4 bg-red-200 rounded animate-pulse w-24 mb-2" />
          <div className="h-4 bg-red-200 rounded animate-pulse w-64 mb-4" />
          <div className="h-11 bg-red-200 rounded animate-pulse w-32" />
        </div>
      </div>
    </div>
  );
}
