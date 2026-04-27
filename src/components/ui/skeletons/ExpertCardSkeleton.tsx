import React from 'react';

const ExpertCardSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm min-h-[320px] flex flex-col animate-pulse">
    <div className="p-6 flex-1 flex flex-col">
      <div className="flex items-start space-x-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 bg-gray-200 rounded animate-pulse"
              />
            ))}
          </div>
          <div className="h-5 bg-gray-200 rounded w-16 animate-pulse" />
        </div>
      </div>
      <div className="space-y-2 mb-6">
        <div className="h-3 bg-gray-200 rounded w-full animate-pulse" />
        <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
      </div>
      <div className="flex space-x-2 mb-4">
        <div className="h-3 bg-gray-200 rounded w-12 animate-pulse" />
        <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
      </div>
      <div className="mt-auto space-y-3">
        <div className="h-6 bg-gray-200 rounded w-20 animate-pulse" />
        <div className="flex space-x-2">
          <div className="h-9 flex-1 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-9 flex-1 bg-primary/20 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

export default ExpertCardSkeleton;
