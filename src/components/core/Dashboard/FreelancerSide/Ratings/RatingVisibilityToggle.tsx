'use client';

import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState } from 'react';

import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useFreelancerData } from '@/hooks/queries/useProfile';
import { useToggleRatingVisibility } from '@/hooks/queries/useRatings';
import { useMySubscription } from '@/hooks/queries/useSubscription';
import { Rating } from '@/types/rating';

interface RatingVisibilityToggleProps {
  rating: Rating;
  onToggle?: () => void;
  className?: string;
}

export function RatingVisibilityToggle({
  rating,
  onToggle,
  className = '',
}: RatingVisibilityToggleProps) {
  const { data: freelancerData } = useFreelancerData();
  const { data: subscription } = useMySubscription();
  const { mutate: toggleVisibility, isPending } = useToggleRatingVisibility();
  const [isVisible, setIsVisible] = useState(rating.isVisible ?? true);

  // Use profile data first, fallback to subscription for backward compatibility
  const canToggle =
    freelancerData?.canToggleRatingVisibility ?? subscription?.canToggleRatingVisibility ?? false;

  const handleToggle = (checked: boolean) => {
    if (!canToggle || isPending) return;

    const previousValue = isVisible;
    setIsVisible(checked);
    toggleVisibility(
      {
        ratingId: rating.id,
        isVisible: checked,
      },
      {
        onSuccess: () => {
          onToggle?.();
        },
        onError: () => {
          // Revert on error
          setIsVisible(previousValue);
        },
      },
    );
  };

  if (!canToggle) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={className}>
              <div className="flex items-center gap-2 text-sm text-gray-500"
                <Eye className="h-4 w-4" />
                <span>Always visible</span>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Upgrade to Silver or Gold to control rating visibility</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
      ) : (
        <>
          {isVisible ? (
            <Eye className="h-4 w-4 text-green-600 />"
          ) : (
            <EyeOff className="h-4 w-4 text-gray-400" />
          )}
        </>
      )}
      <Switch
        checked={isVisible}
        onCheckedChange={handleToggle}
        disabled={isPending}
        aria-label={`Toggle rating visibility (currently ${isVisible ? 'visible' : 'hidden'})`}
      />
      <span className="text-xs text-gray-600"
        {isVisible ? 'Visible' : 'Hidden'}
      </span>
    </div>
  );
}
