'use client';

import { cn } from '@/lib/utils';

interface SidebarSkeletonProps {
  className?: string;
}

export function SidebarSkeleton({ className }: SidebarSkeletonProps) {
  return (
    <div
      className={cn(
        'hidden md:flex fixed inset-y-0 z-10 h-svh w-[14rem] left-0 p-4 bg-dashboard !border-r-0',
        className,
      )}
    >
      <div className="flex h-full w-full flex-col bg-sidebar rounded-md dark:border dark:border-[#007745] px-2">
        {/* Header skeleton - Logo */}
        <div className="mx-auto w-full mb-6 px-2 py-6">
          <div className="h-10 w-36 bg-gray-200 dark:bg-gray-700/30 rounded-md animate-pulse mx-auto" />
        </div>

        {/* Navigation menu items skeleton */}
        <div className="flex-1 space-y-4 px-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-5 py-3 h-[40px] bg-secondary/20 rounded-md overflow-hidden relative"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              {/* Icon skeleton */}
              <div className="h-5 w-5 bg-gray-300 dark:bg-gray-600/40 rounded" />
              {/* Text skeleton */}
              <div
                className="h-4 bg-gray-300 dark:bg-gray-600/40 rounded flex-1"
                style={{ width: `${Math.random() * 30 + 50}%` }}
              />
            </div>
          ))}
        </div>

        {/* Footer skeleton - Sign out button */}
        <div className="mt-auto pt-4 px-2">
          <div className="h-px bg-border/50 mb-4" />
          <div className="flex items-center gap-3 px-5 py-2 h-10 bg-secondary/20 rounded-md overflow-hidden relative">
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="h-4 w-4 bg-gray-300 dark:bg-gray-600/40 rounded" />
            <div className="h-4 w-20 bg-gray-300 dark:bg-gray-600/40 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Mobile version
export function SidebarSkeletonMobile({ className }: SidebarSkeletonProps) {
  return (
    <div className={cn('flex md:hidden items-center justify-center p-4', className)}>
      <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700/30 rounded-md animate-pulse" />
    </div>
  );
}
