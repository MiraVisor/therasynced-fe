'use client';

import { cn } from '@/lib/utils';

interface PageSkeletonProps {
  className?: string;
  showHeader?: boolean;
  rows?: number;
}

export function PageSkeleton({ className, showHeader = true, rows = 6 }: PageSkeletonProps) {
  return (
    <div className={cn('w-full space-y-6 ml-11', className)}>
      {/* Header skeleton */}
      {showHeader && (
        <div className="space-y-3">
          <div className="h-8 bg-gray-200 dark:bg-gray-700/30 rounded animate-pulse w-1/3" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700/20 rounded animate-pulse w-1/2" />
        </div>
      )}

      {/* Content rows skeleton */}
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="flex gap-4 p-4 bg-gray-100 dark:bg-gray-800/20 rounded-lg overflow-hidden relative"
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {Array.from({ length: 3 }).map((_, colIndex) => (
              <div key={colIndex} className="h-8 bg-gray-200 dark:bg-gray-700/30 rounded flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Admin page skeleton with stats cards and filters
export function AdminPageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('w-full space-y-6 lg:space-y-8', className)}>
      {/* Header */}
      <div className="h-8 bg-gray-200 dark:bg-gray-700/30 rounded animate-pulse w-1/4" />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-6 bg-card border rounded-lg space-y-4 overflow-hidden relative">
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700/30 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700/20 rounded w-2/3" />
                <div className="h-6 bg-gray-200 dark:bg-gray-700/30 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 overflow-x-auto">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="px-6 py-3 bg-gray-100 dark:bg-gray-800/20 rounded-lg overflow-hidden relative min-w-[120px]"
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="h-4 bg-gray-200 dark:bg-gray-700/30 rounded w-16" />
          </div>
        ))}
      </div>

      {/* Data Table */}
      <div className="bg-card border rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700/30 rounded w-1/4" />
            <div className="h-10 bg-gray-100 dark:bg-gray-800/20 rounded w-64" />
          </div>
        </div>

        {/* Table Rows */}
        <div className="divide-y">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="p-4 flex items-center gap-4 overflow-hidden relative">
              {/* Shimmer effect */}
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              <div className="h-4 bg-gray-200 dark:bg-gray-700/30 rounded flex-1" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700/20 rounded w-24" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700/20 rounded w-32" />
              <div className="h-8 bg-gray-200 dark:bg-gray-700/30 rounded w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// User page skeleton for dashboard
export function UserPageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('w-full space-y-6 lg:space-y-8', className)}>
      {/* Header */}
      <div className="h-8 bg-gray-200 dark:bg-gray-700/30 rounded animate-pulse w-1/4" />

      {/* Next Appointment Hero Skeleton */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-8 overflow-hidden relative">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="flex-1">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-1/3"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          </div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
        </div>
      </div>

      {/* Booking History Chart Skeleton */}
      <div className="border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl overflow-hidden">
        <div className="border-b border-gray-100 bg-gradient-to-r from-mint/30 to-white px-5 py-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700/30 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700/20 rounded w-1/2"></div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-3 gap-4 mb-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-4 bg-gray-200 dark:bg-gray-700/20 rounded w-16 mx-auto mb-1"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700/30 rounded w-12 mx-auto"></div>
              </div>
            ))}
          </div>
          <div className="h-[220px] bg-gray-100 dark:bg-gray-800/20 rounded"></div>
        </div>
      </div>

      {/* Favorite Freelancers Carousel Skeleton */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700/30 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700/20 rounded w-1/2"></div>
        </div>
        <div className="p-6">
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-64 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4 overflow-hidden relative"
              >
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700/60 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700/60 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700/60 rounded w-2/3"></div>
                </div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Booking Activity Skeleton */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700/30 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700/20 rounded w-1/2"></div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden relative"
              >
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700/30 rounded w-16"></div>
                  </div>
                  <div className="flex items-center gap-4">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700/60 rounded"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700/60 rounded w-12"></div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  </div>
                </div>
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700/30 rounded ml-4"></div>
              </div>
            ))}
          </div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700/30 rounded w-full mt-4"></div>
        </div>
      </div>
    </div>
  );
}
