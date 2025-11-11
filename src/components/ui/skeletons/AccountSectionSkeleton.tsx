export function SubscriptionSectionSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="h-8 bg-gray-200 rounded animate-pulse w-48 mb-2" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-64" />
      </div>

      {/* Current Subscription Status Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-32" />
          <div className="h-6 bg-gray-200 rounded animate-pulse w-20" />
        </div>

        <div className="space-y-4">
          {/* Plan info */}
          <div className="flex items-center justify-between rounded-lg bg-gray-100 p-4">
            <div>
              <div className="h-5 bg-gray-200 rounded animate-pulse w-24 mb-1" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
            </div>
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Alert or status info */}
          <div className="h-16 bg-gray-100 rounded animate-pulse" />

          {/* Action buttons */}
          <div className="flex gap-3">
            <div className="h-10 bg-gray-200 rounded animate-pulse flex-1" />
            <div className="h-10 bg-gray-200 rounded animate-pulse flex-1" />
          </div>
        </div>
      </div>

      {/* Available Plans Section */}
      <div>
        <div className="h-7 bg-gray-200 rounded animate-pulse w-56 mb-4" />
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="space-y-4">
                {/* Plan header */}
                <div className="text-center">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-20 mx-auto mb-2" />
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-16 mx-auto mb-1" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mx-auto" />
                </div>

                {/* Features list */}
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded animate-pulse flex-1" />
                    </div>
                  ))}
                </div>

                {/* Button */}
                <div className="h-10 bg-gray-200 rounded animate-pulse w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AccountSectionSkeleton() {
  return (
    <div className="space-y-8">
      {/* Email Management Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-40 mb-6" />
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
            <div className="h-11 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-11 bg-gray-200 rounded animate-pulse w-32" />
        </div>
      </div>

      {/* Password Management Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-48 mb-6" />
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
              <div className="h-11 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-28" />
              <div className="h-11 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-40" />
            <div className="h-11 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-11 bg-gray-200 rounded animate-pulse w-36" />
        </div>
      </div>

      {/* Danger Zone Section */}
      <div className="bg-white border border-red-200 rounded-xl p-6">
        <div className="h-6 bg-red-200 rounded animate-pulse w-24 mb-4" />
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <div className="h-5 bg-red-200 rounded animate-pulse w-28 mb-2" />
          <div className="h-4 bg-red-200 rounded animate-pulse w-64 mb-4" />
          <div className="h-11 bg-red-200 rounded animate-pulse w-32" />
        </div>
      </div>
    </div>
  );
}
