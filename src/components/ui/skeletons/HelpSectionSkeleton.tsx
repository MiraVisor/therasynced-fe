export function HelpSectionSkeleton() {
  return (
    <div className="space-y-8">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="h-5 bg-gray-200 rounded animate-pulse w-32 mb-6" />

        <div className="space-y-6">
          {/* Contact Admin Button */}
          <div className="text-center py-8">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-24 mb-3" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-64 mb-6" />
            <div className="h-12 bg-gray-200 rounded animate-pulse w-32 mx-auto" />
          </div>

          {/* FAQs */}
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-48" />

            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg">
                <div className="w-full p-4 flex items-center justify-between">
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-64" />
                  <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
