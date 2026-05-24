'use client';

import { cn } from '@/lib/utils';

interface BookingCardSkeletonProps {
  className?: string;
}

export const BookingCardSkeleton = ({ className }: BookingCardSkeletonProps) => {
  return (
    <div
      className={cn(
        'bg-white border border-gray-200 rounded-2xl shadow-soft overflow-hidden',
        className,
      )}
    >
      <div className="p-5">
        {/* Header with status badge skeleton */}
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-200 rounded-full animate-pulse w-20" />
          <div className="h-6 bg-gray-200 rounded animate-pulse w-16" />
        </div>

        {/* Main content skeleton */}
        <div className="flex items-start gap-3 mb-4">
          {/* Time badge skeleton */}
          <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg p-3 min-w-[60px] border border-gray-200">
            <div className="h-5 bg-gray-200 rounded animate-pulse w-8 mb-1" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-6" />
          </div>

          {/* Content skeleton */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons skeleton */}
        <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-gray-200">
          <div className="h-8 bg-gray-200 rounded animate-pulse flex-1" />
          <div className="h-8 bg-gray-200 rounded animate-pulse flex-1" />
          <div className="h-8 bg-gray-200 rounded animate-pulse flex-1" />
        </div>
      </div>
    </div>
  );
};
