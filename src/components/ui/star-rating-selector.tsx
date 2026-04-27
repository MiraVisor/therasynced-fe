'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';

interface StarRatingSelectorProps {
  value?: number;
  onChange?: (rating: number) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export const StarRatingSelector: React.FC<StarRatingSelectorProps> = ({
  value = 0,
  onChange,
  disabled = false,
  size = 'md',
  className,
}) => {
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleClick = (rating: number) => {
    if (!disabled && onChange) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (!disabled) {
      setHoveredRating(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!disabled) {
      setHoveredRating(0);
    }
  };

  const displayRating = hoveredRating || value;

  return (
    <div
      className={cn('flex items-center gap-1', className)}
      role="radiogroup"
      aria-label="Rating selector"
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= displayRating;
        return (
          <button
            key={star}
            type="button"
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            disabled={disabled}
            className={cn(
              'transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded',
              disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110',
            )}
            aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
            aria-pressed={star === value}
          >
            <Star
              className={cn(
                sizeClasses[size],
                isFilled
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-300  ',
                'transition-colors duration-150',
              )}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRatingSelector;
