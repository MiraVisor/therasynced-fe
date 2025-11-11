export const ChatContactsSkeleton = () => {
  return (
    <div className="flex-1 overflow-y-auto">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-12" />
              </div>
              <div className="flex items-center justify-between">
                <div className="h-3 bg-gray-200 rounded animate-pulse w-32" />
                <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const ChatMessagesSkeleton = () => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
          <div
            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              i % 2 === 0 ? 'bg-gray-100' : 'bg-primary'
            }`}
          >
            <div
              className={`h-4 ${i % 2 === 0 ? 'w-32' : 'w-24'} bg-gray-200 rounded animate-pulse mb-2`}
            />
            <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
};
