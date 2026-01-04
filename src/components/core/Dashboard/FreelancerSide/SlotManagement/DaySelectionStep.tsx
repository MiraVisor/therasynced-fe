'use client';

import { toast } from 'react-toastify';

import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { PlanType } from '@/types/types';
import { getMaxDaysForTier, getTierDisplayName } from '@/utils/tierUtils';

const DAY_NAMES = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
] as const;

interface DaySelectionStepProps {
  selectedDays: string[];
  onDaysChange: (days: string[]) => void;
  tier: PlanType | null;
  /**
   * Whether user is in trial (unlimited access)
   */
  isInTrial?: boolean;
  /**
   * Max days per week from subscription (null = unlimited)
   */
  maxDaysPerWeek?: number | null;
}

export const DaySelectionStep = ({
  selectedDays,
  onDaysChange,
  tier,
  isInTrial = false,
  maxDaysPerWeek,
}: DaySelectionStepProps) => {
  // Trial users get unlimited days (7 days)
  // Otherwise use maxDaysPerWeek from subscription, or fall back to tier-based limit
  const maxDays =
    isInTrial || maxDaysPerWeek === null
      ? 7 // Unlimited for trials
      : maxDaysPerWeek !== undefined
        ? maxDaysPerWeek
        : getMaxDaysForTier(tier);
  const tierDisplayName = isInTrial ? 'Trial' : getTierDisplayName(tier);

  const toggleDay = (dayKey: string) => {
    if (selectedDays.includes(dayKey)) {
      // Allow deselection
      onDaysChange(selectedDays.filter((d) => d !== dayKey));
    } else {
      // Check if at tier limit (but not for trials - they have unlimited)
      if (!isInTrial && selectedDays.length >= maxDays) {
        toast.error(
          `You can only select up to ${maxDays} days with your ${tierDisplayName} plan. Please deselect a day first or upgrade to select more.`,
        );
        return;
      }
      // Allow selection - freelancer can choose any days up to limit
      onDaysChange([...selectedDays, dayKey]);
    }
  };

  // Trial users never hit a limit (maxDays = 7 for them)
  const isAtLimit = !isInTrial && selectedDays.length >= maxDays;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-charcoal">Select Available Days</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            {selectedDays.length} / {maxDays} days selected
            {tierDisplayName && ` (${tierDisplayName} Plan)`}
          </span>
          {tierDisplayName && (
            <Badge variant="outline" className="text-xs">
              {tierDisplayName}
            </Badge>
          )}
        </div>
        {isAtLimit && tier !== 'GOLD' && maxDays < 7 && (
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-xs text-primary">
              You&apos;ve reached your {tierDisplayName} plan limit of {maxDays} days. Upgrade to
              select more days.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DAY_NAMES.map((day) => {
          const isSelected = selectedDays.includes(day.key);
          const isDisabled = isAtLimit && !isSelected; // Disable if at limit and not selected

          return (
            <div
              key={day.key}
              className={`
                flex items-center gap-3 p-4 border-2 rounded-lg transition-all duration-200
                ${
                  isSelected
                    ? 'bg-primary/10 border-primary shadow-sm'
                    : isDisabled
                      ? 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }
                ${isDisabled ? '' : 'cursor-pointer'}
              `}
              onClick={() => !isDisabled && toggleDay(day.key)}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => !isDisabled && toggleDay(day.key)}
                disabled={isDisabled}
                className="h-5 w-5"
              />
              <Label
                className={`text-sm font-medium flex-1 ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {day.label}
              </Label>
            </div>
          );
        })}
      </div>

      {selectedDays.length === 0 && (
        <div className="p-4 bg-muted/50 border-2 border-dashed border-muted-foreground/20 rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            Please select at least one day to continue (up to {maxDays} days with{' '}
            {tierDisplayName || 'your current'} plan)
          </p>
        </div>
      )}
    </div>
  );
};
