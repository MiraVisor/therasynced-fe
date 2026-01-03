'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useFreelancerData } from '@/hooks/queries/useProfile';
import { useMySubscription } from '@/hooks/queries/useSubscription';

export function RatingVisibilityToggle() {
  const { data: freelancerData } = useFreelancerData();
  const { data: subscription } = useMySubscription();

  // Use profile data first, fallback to subscription for backward compatibility
  const canToggle =
    freelancerData?.canToggleRatingVisibility ?? subscription?.canToggleRatingVisibility ?? false;

  // Show component if we have either freelancerData or subscription
  if (!freelancerData && !subscription) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="ratingVisibility" className="text-sm font-medium text-gray-700">
            Rating Visibility
          </Label>
          <p className="text-xs text-gray-500 mt-1">
            {canToggle
              ? 'Control whether your ratings are visible to the public on your profile.'
              : 'Bronze tier ratings are always visible. Upgrade to Silver or Gold tier to control visibility.'}
          </p>
        </div>
        {canToggle ? (
          <Switch id="ratingVisibility" disabled={true} />
        ) : (
          <span className="text-sm text-gray-500">Always visible</span>
        )}
      </div>
    </div>
  );
}
