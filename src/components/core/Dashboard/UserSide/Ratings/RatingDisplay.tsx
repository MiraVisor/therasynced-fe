'use client';

import { Star } from 'lucide-react';

import { cn } from '@/lib/utils';

interface RatingDisplayProps {
  rating?: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export const RatingDisplay: React.FC<RatingDisplayProps> = ({
  rating,
  reviewCount = 0,
  size = 'md',
  showCount = true,
  className,
}) => {
  if (rating === undefined || rating === null || rating === 0) {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              sizeClasses[size],
              'fill-gray-200 text-gray-300 dark:fill-gray-700 dark:text-gray-600',
            )}
          />
        ))}
      </div>
    );
  }

  const roundedRating = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5 && rating % 1 < 1;

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= roundedRating;
          const isHalfFilled = star === roundedRating + 1 && hasHalfStar;

          return (
            <Star
              key={star}
              className={cn(
                sizeClasses[size],
                isFilled
                  ? 'fill-yellow-400 text-yellow-400'
                  : isHalfFilled
                    ? 'fill-yellow-200 text-yellow-400'
                    : 'fill-gray-200 text-gray-300 dark:fill-gray-700 dark:text-gray-600',
              )}
            />
          );
        })}
      </div>
      {showCount && (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {rating.toFixed(1)}{' '}
          {reviewCount > 0 && `(${reviewCount} ${reviewCount === 1 ? 'review' : 'reviews'})`}
        </span>
      )}
    </div>
  );
};

export default RatingDisplay;
