'use client';

import { cn } from '@/lib/utils';

interface PageSkeletonProps {
  className?: string;
  showHeader?: boolean;
  rows?: number;
}

export function PageSkeleton({ className, showHeader = true, rows = 6 }: PageSkeletonProps) {
  return (
    <div className={cn('w-full space-y-6', className)}>
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
