'use client';

import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
  count: number;
  className?: string;
  maxCount?: number;
}

export function NotificationBadge({ count, className, maxCount = 99 }: NotificationBadgeProps) {
  if (count === 0) return null;

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <div
      className={cn(
        'absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full',
        'bg-red-500 text-white text-xs font-semibold',
        'flex items-center justify-center',
        'transition-all duration-300',
        'hover:scale-110 hover:bg-red-600',
        className,
      )}
    >
      {displayCount}
    </div>
  );
}
