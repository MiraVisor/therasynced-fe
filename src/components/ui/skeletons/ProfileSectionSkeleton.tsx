interface ProfileSectionSkeletonProps {
  showProfessionalSection?: boolean;
}

export function ProfileSectionSkeleton({
  showProfessionalSection = false,
}: ProfileSectionSkeletonProps) {
  return (
    <div className="space-y-8">
      {/* Profile Form */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-5 bg-gray-200 rounded animate-pulse w-48" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form fields */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
              <div className="h-11 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-6">
          <div className="h-11 bg-gray-200 rounded animate-pulse w-32" />
        </div>
      </div>

      {/* Professional Information Section - Only for Freelancers */}
      {showProfessionalSection && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="h-5 bg-gray-200 rounded animate-pulse w-48" />
            <div className="h-6 bg-gray-200 rounded animate-pulse w-20" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Professional form fields */}
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
                <div className="h-11 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <div className="h-11 bg-gray-200 rounded animate-pulse w-32" />
          </div>
        </div>
      )}
    </div>
  );
}
