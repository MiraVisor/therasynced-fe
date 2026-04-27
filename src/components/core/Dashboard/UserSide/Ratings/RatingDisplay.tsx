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
  // Ensure rating is a valid number
  const numericRating = typeof rating === 'number' ? rating : Number(rating) || 0;

  if (numericRating === 0 || isNaN(numericRating)) {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              sizeClasses[size],
              'fill-gray-200 text-gray-300
            )}
          />
        ))}
      </div>
    );
  }

  const roundedRating = Math.floor(numericRating);
  const decimalPart = numericRating % 1;
  const hasHalfStar = decimalPart >= 0.5 && decimalPart < 1;

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= roundedRating;
          const isHalfFilled = star === roundedRating + 1 && hasHalfStar;

          if (isHalfFilled) {
            // Render half-star using overflow and positioning
            return (
              <div
                key={star}
                className="relative inline-block"
                style={{ width: sizeClasses[size], height: sizeClasses[size] }}
              >
                {/* Empty star background */}
                <Star
                  className={cn(
                    sizeClasses[size],
                    'fill-gray-200 text-gray-300
                  )}
                />
                {/* Half-filled star - clipped to left half */}
                <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                  <Star className={cn(sizeClasses[size], 'fill-yellow-400 text-yellow-400')} />
                </div>
              </div>
            );
          }

          return (
            <Star
              key={star}
              className={cn(
                sizeClasses[size],
                isFilled
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-300
              )}
            />
          );
        })}
      </div>
      {showCount && (
        <span className="text-sm text-gray-600"
          {numericRating.toFixed(1)}{' '}
          {reviewCount > 0 && `(${reviewCount} ${reviewCount === 1 ? 'review' : 'reviews'})`}
        </span>
      )}
    </div>
  );
};

export default RatingDisplay;
