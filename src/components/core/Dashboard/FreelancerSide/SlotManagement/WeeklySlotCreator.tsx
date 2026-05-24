'use client';

import { addDays, endOfWeek, format } from 'date-fns';
import { AlertCircle, Copy, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/ui/loading-spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFreelancerPricing } from '@/hooks/queries/usePricing';
import { useCreateSlotsLegacy, useLastWeekPattern } from '@/hooks/queries/useSlots';
import { useMySubscription } from '@/hooks/queries/useSubscription';
import { cn } from '@/lib/utils';
import type { DaySlotConfiguration, LegacyCreateSlotsDto } from '@/types/slot';
import { filterPastSlots, generateSlotsFromDayConfigurations } from '@/utils/slotGenerationUtils';
import { getMaxDaysForTier, getTierFromSubscription } from '@/utils/tierUtils';

interface WeeklySlotCreatorProps {
  weekStart: Date;
  onSuccess?: () => void;
  onClose?: () => void;
}

const DAYS = [
  { key: 'monday', label: 'Mon' },
  { key: 'tuesday', label: 'Tue' },
  { key: 'wednesday', label: 'Wed' },
  { key: 'thursday', label: 'Thu' },
  { key: 'friday', label: 'Fri' },
  { key: 'saturday', label: 'Sat' },
  { key: 'sunday', label: 'Sun' },
] as const;

const DURATIONS = [30, 45, 60, 90, 120];

export const WeeklySlotCreator = ({ weekStart, onSuccess, onClose }: WeeklySlotCreatorProps) => {
  const { data: currentSubscription } = useMySubscription();
  const tier = getTierFromSubscription(currentSubscription || null);
  // Use tier-based max days: Bronze=3, Silver=5, Gold=7, default=3 for no subscription
  const maxDaysPerWeek = currentSubscription?.maxDaysPerWeek ?? getMaxDaysForTier(tier) ?? 3;

  // Initialize selected days based on tier limit
  const getInitialDays = () => {
    const allWeekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    return allWeekdays.slice(0, Math.min(maxDaysPerWeek, allWeekdays.length));
  };

  const [selectedDays, setSelectedDays] = useState<string[]>(getInitialDays);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [slotDuration, setSlotDuration] = useState(60);
  const [breakFrom, setBreakFrom] = useState('');
  const [breakTill, setBreakTill] = useState('');

  const { mutate: createSlot, isPending: isCreating } = useCreateSlotsLegacy();
  const { data: pricingData } = useFreelancerPricing();

  const { data: lastWeekPattern, isLoading: isLoadingPattern } = useLastWeekPattern({
    weekStart: format(addDays(weekStart, -7), 'yyyy-MM-dd'),
  });

  // Check if selected duration has pricing configured
  const hasPricingForDuration = useMemo(() => {
    if (!pricingData?.durationPricing) return false;
    return pricingData.durationPricing.some((dp) => dp.duration === slotDuration && dp.price > 0);
  }, [pricingData, slotDuration]);

  // Get configured duration prices for display
  const configuredDurations = useMemo(() => {
    if (!pricingData?.durationPricing) return [];
    return pricingData.durationPricing.filter((dp) => dp.price > 0).map((dp) => dp.duration);
  }, [pricingData]);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day);
      }
      // Check tier limit
      if (prev.length >= maxDaysPerWeek) {
        const tierName = tier ? tier.charAt(0) + tier.slice(1).toLowerCase() : 'Free';
        toast.warning(
          `${tierName} plan allows maximum ${maxDaysPerWeek} days per week. Upgrade to add more days.`,
        );
        return prev;
      }
      return [...prev, day];
    });
  };

  const handleCopyFromLastWeek = () => {
    if (!lastWeekPattern?.hasPattern) {
      toast.info('No pattern found from last week');
      return;
    }

    const { pattern } = lastWeekPattern;
    const enabledDays = Object.entries(pattern)
      .filter(([_, dayPattern]) => dayPattern.enabled)
      .map(([day]) => day);

    if (enabledDays.length === 0) {
      toast.info('No slots found from last week');
      return;
    }

    // Apply the pattern
    setSelectedDays(enabledDays);
    setSlotDuration(lastWeekPattern.mostCommonDuration || 60);
    setStartTime(lastWeekPattern.mostCommonStartTime || '09:00');
    setEndTime(lastWeekPattern.mostCommonEndTime || '17:00');

    toast.success('Pattern copied from last week');
  };

  const calculateSlotCount = () => {
    if (selectedDays.length === 0) return 0;

    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    let workMinutes =
      (endHour ?? 0) * 60 + (endMin ?? 0) - ((startHour ?? 0) * 60 + (startMin ?? 0));

    // Subtract break time if set
    if (breakFrom && breakTill) {
      const [breakStartHour, breakStartMin] = breakFrom.split(':').map(Number);
      const [breakEndHour, breakEndMin] = breakTill.split(':').map(Number);
      const breakMinutes =
        (breakEndHour ?? 0) * 60 +
        (breakEndMin ?? 0) -
        ((breakStartHour ?? 0) * 60 + (breakStartMin ?? 0));
      workMinutes -= breakMinutes;
    }

    const slotsPerDay = Math.floor(workMinutes / slotDuration);
    return slotsPerDay * selectedDays.length;
  };

  const handleSubmit = () => {
    if (selectedDays.length === 0) {
      toast.error('Please select at least one day');
      return;
    }

    if (startTime >= endTime) {
      toast.error('Start time must be before end time');
      return;
    }

    // Validate break times
    if ((breakFrom && !breakTill) || (!breakFrom && breakTill)) {
      toast.error('Both break start and end times are required');
      return;
    }

    if (breakFrom && breakTill && breakFrom >= breakTill) {
      toast.error('Break start time must be before break end time');
      return;
    }

    // Build day configurations
    const dayConfigs: DaySlotConfiguration[] = selectedDays.map((day) => ({
      day,
      startTime,
      endTime,
      slotDuration,
      breakFrom: breakFrom || '',
      breakTill: breakTill || '',
    }));

    // Generate slots for the selected week only
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const generatedSlots = generateSlotsFromDayConfigurations(dayConfigs, weekStart, weekEnd);

    if (generatedSlots.length === 0) {
      toast.error('No slots could be generated from the current configuration');
      return;
    }

    // Filter out past slots
    const allSlots = generatedSlots.map((slot) => ({
      startTime: slot.startTime,
      endTime: slot.endTime,
    }));
    const slots = filterPastSlots(allSlots);

    if (slots.length === 0) {
      toast.error('All generated slots are in the past');
      return;
    }

    const submitData: LegacyCreateSlotsDto = {
      duration: slotDuration,
      slots,
    };

    createSlot(submitData, {
      onSuccess: (response) => {
        const message = response.message || '';
        const hasSkipped = message.toLowerCase().includes('skipped');

        if (hasSkipped) {
          toast.warning(message || 'Some slots were skipped due to conflicts');
        } else {
          toast.success(`Successfully created ${slots.length} slots for this week!`);
        }
        onSuccess?.();
      },
      onError: (error: unknown) => {
        let errorMessage = 'Failed to create slots';
        // Handle API error format from interceptor: { message, status, data }
        if (error && typeof error === 'object') {
          if ('message' in error && typeof (error as { message: unknown }).message === 'string') {
            errorMessage = (error as { message: string }).message;
          }
        }
        toast.error(errorMessage);
      },
    });
  };

  const slotCount = calculateSlotCount();
  const weekEndDate = endOfWeek(weekStart, { weekStartsOn: 1 });

  return (
    <Card className="border-primary/20 shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-poppins">
              Set Hours for Week of {format(weekStart, 'MMM d')} - {format(weekEndDate, 'MMM d')}
            </CardTitle>
            <CardDescription className="mt-1">
              Configure your working hours for this week
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {lastWeekPattern?.hasPattern && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyFromLastWeek}
                disabled={isLoadingPattern}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy from Last Week
              </Button>
            )}
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Day Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Select days you&apos;re available:</Label>
          <div className="flex flex-wrap gap-2">
            {DAYS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => toggleDay(key)}
                className={cn(
                  'px-4 py-2 rounded-lg border font-medium text-sm transition-all',
                  selectedDays.includes(key)
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary/50',
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {tier ? `${tier.charAt(0) + tier.slice(1).toLowerCase()} plan` : 'Your plan'}:{' '}
            {maxDaysPerWeek} days/week max. Selected: {selectedDays.length}/{maxDaysPerWeek}
          </p>
        </div>

        {/* Time Settings */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Start Time</Label>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">End Time</Label>
            <Input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Slot Duration</Label>
            <Select
              value={slotDuration.toString()}
              onValueChange={(v) => setSlotDuration(parseInt(v))}
            >
              <SelectTrigger className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATIONS.map((d) => (
                  <SelectItem key={d} value={d.toString()}>
                    {d} min
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Break Time (Optional) */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">Break Time (optional)</Label>
          <div className="grid grid-cols-2 gap-4 max-w-xs">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">From</Label>
              <Input
                type="time"
                value={breakFrom}
                onChange={(e) => setBreakFrom(e.target.value)}
                className="bg-white"
                placeholder="e.g., 12:00"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">To</Label>
              <Input
                type="time"
                value={breakTill}
                onChange={(e) => setBreakTill(e.target.value)}
                className="bg-white"
                placeholder="e.g., 13:00"
              />
            </div>
          </div>
        </div>

        {/* Pricing Warning */}
        {!hasPricingForDuration && (
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              No pricing configured for {slotDuration} minute slots.
              {configuredDurations.length > 0 ? (
                <> You have pricing for: {configuredDurations.map((d) => `${d} min`).join(', ')}.</>
              ) : (
                <> Please set up duration pricing first.</>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Preview and Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm">
            <span className="text-muted-foreground">Preview: </span>
            <span className="font-medium text-charcoal">
              This will create {slotCount} slot{slotCount !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {onClose && (
              <Button variant="outline" onClick={onClose} disabled={isCreating}>
                Cancel
              </Button>
            )}
            <Button
              onClick={handleSubmit}
              disabled={
                selectedDays.length === 0 || slotCount === 0 || isCreating || !hasPricingForDuration
              }
            >
              {isCreating ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creating...
                </>
              ) : (
                'Create Slots for This Week'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
