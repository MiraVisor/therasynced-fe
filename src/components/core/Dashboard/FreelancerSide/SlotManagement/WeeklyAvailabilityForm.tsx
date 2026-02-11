'use client';

import { startOfDay, startOfWeek } from 'date-fns';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateSlotsLegacy } from '@/hooks/queries/useSlots';
import { useMySubscription } from '@/hooks/queries/useSubscription';
import { cn } from '@/lib/utils';
import type { BlockedPeriod, LegacyCreateSlotsDto, WeeklyAvailabilityTemplate } from '@/types/slot';
import { LocationType } from '@/types/types';
import { filterPastSlots, generateSlotsFromTemplate } from '@/utils/slotGenerationUtils';

interface WeeklyAvailabilityFormProps {
  onSuccess?: () => void;
}

const DAY_NAMES = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
] as const;

export const WeeklyAvailabilityForm = ({ onSuccess }: WeeklyAvailabilityFormProps) => {
  const { mutate: createSlot, isPending: isCreating } = useCreateSlotsLegacy();
  const { data: subscription } = useMySubscription();

  const [template, setTemplate] = useState<WeeklyAvailabilityTemplate>({
    days: {
      monday: { enabled: false, startTime: '09:00', endTime: '17:00' },
      tuesday: { enabled: false, startTime: '09:00', endTime: '17:00' },
      wednesday: { enabled: false, startTime: '09:00', endTime: '17:00' },
      thursday: { enabled: false, startTime: '09:00', endTime: '17:00' },
      friday: { enabled: false, startTime: '09:00', endTime: '17:00' },
      saturday: { enabled: false, startTime: '09:00', endTime: '17:00' },
      sunday: { enabled: false, startTime: '09:00', endTime: '17:00' },
    },
    slotDuration: 60,
    breakDuration: 0,
    blockedPeriods: [],
  });

  const [formData, setFormData] = useState<{
    locationType: LocationType | undefined;
    basePrice: number;
  }>({
    locationType: undefined, // Optional - defaults to CLINIC if not provided
    basePrice: 50,
  });

  const [errors, setErrors] = useState<{
    days?: string;
    slotDuration?: string;
    breakDuration?: string;
    blockedPeriods?: string;
    price?: string;
  }>({});

  const updateDay = (
    dayKey: keyof WeeklyAvailabilityTemplate['days'],
    updates: Partial<WeeklyAvailabilityTemplate['days'][typeof dayKey]>,
  ) => {
    setTemplate((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [dayKey]: {
          ...prev.days[dayKey],
          ...updates,
        },
      },
    }));
  };

  const addBlockedPeriod = () => {
    const newBlockedPeriod: BlockedPeriod = {
      id: `blocked-${Date.now()}-${Math.random()}`,
      date: new Date(),
      startTime: '11:00',
      endTime: '15:00',
    };
    setTemplate((prev) => ({
      ...prev,
      blockedPeriods: [...prev.blockedPeriods, newBlockedPeriod],
    }));
  };

  const removeBlockedPeriod = (id: string) => {
    setTemplate((prev) => ({
      ...prev,
      blockedPeriods: prev.blockedPeriods.filter((bp) => bp.id !== id),
    }));
  };

  const updateBlockedPeriod = (id: string, updates: Partial<BlockedPeriod>) => {
    setTemplate((prev) => ({
      ...prev,
      blockedPeriods: prev.blockedPeriods.map((bp) => (bp.id === id ? { ...bp, ...updates } : bp)),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Check if at least one day is enabled
    const enabledDays = Object.values(template.days).filter((day) => day.enabled);
    if (enabledDays.length === 0) {
      newErrors.days = 'Please enable at least one day';
    }

    // Validate day times
    for (const day of enabledDays) {
      if (day.startTime >= day.endTime) {
        newErrors.days = 'Start time must be before end time for all enabled days';
        break;
      }
    }

    // Validate slot duration
    if (template.slotDuration <= 0) {
      newErrors.slotDuration = 'Slot duration must be greater than 0';
    }

    // Validate break duration
    if (template.breakDuration < 0) {
      newErrors.breakDuration = 'Break duration cannot be negative';
    }

    // Validate price
    if (formData.basePrice <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    // Validate blocked periods don't overlap
    for (let i = 0; i < template.blockedPeriods.length; i++) {
      const bp1 = template.blockedPeriods[i];
      if (!bp1) continue;
      for (let j = i + 1; j < template.blockedPeriods.length; j++) {
        const bp2 = template.blockedPeriods[j];
        if (!bp2) continue;
        if (
          bp1.date?.toDateString() === bp2.date?.toDateString() &&
          bp1.startTime < bp2.endTime &&
          bp1.endTime > bp2.startTime
        ) {
          newErrors.blockedPeriods = 'Blocked periods cannot overlap';
          break;
        }
      }
      if (newErrors.blockedPeriods) break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // locationType is optional - defaults to CLINIC if not provided
    // No validation needed

    if (!validateForm()) {
      return;
    }

    // Generate slots for current week
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const generatedSlots = generateSlotsFromTemplate(template, weekStart);

    if (generatedSlots.length === 0) {
      toast.error('No slots could be generated from the current configuration');
      return;
    }

    // Convert to CreateSlotDto format
    // locationType is optional - only include if specified (defaults to CLINIC on backend)
    const allSlots = generatedSlots.map((slot) => ({
      startTime: slot.startTime,
      endTime: slot.endTime,
      ...(formData.locationType && { locationType: formData.locationType }), // Optional
    }));

    // Filter out past slots
    const slots = filterPastSlots(allSlots);
    const pastSlotsCount = allSlots.length - slots.length;

    if (slots.length === 0) {
      toast.error(
        pastSlotsCount > 0
          ? 'All generated slots are in the past. Please adjust your configuration to include future dates.'
          : 'No slots could be generated from the current configuration',
      );
      return;
    }

    if (pastSlotsCount > 0) {
      toast.info(
        `Filtered out ${pastSlotsCount} past slot${pastSlotsCount !== 1 ? 's' : ''}. Creating ${slots.length} future slot${slots.length !== 1 ? 's' : ''}.`,
      );
    }

    const submitData: LegacyCreateSlotsDto = {
      ...(formData.locationType && { locationType: formData.locationType }), // Optional
      basePrice: formData.basePrice,
      duration: template.slotDuration,
      slots,
    };

    createSlot(submitData, {
      onSuccess: (response) => {
        // Parse the message to check for skipped slots
        const message = response.message ?? '';
        const hasSkipped = message.toLowerCase().includes('skipped');
        const hasUpdated = message.toLowerCase().includes('updated');

        // Show appropriate notification based on the response
        if (hasSkipped) {
          // Show warning if slots were skipped
          toast.warning(
            message ?? 'Some slots could not be created due to overlaps with booked slots',
          );
        } else if (hasUpdated) {
          // Show info if slots were updated
          toast.info(message ?? 'Slots processed successfully');
        } else {
          // Show success for normal creation
          toast.success(
            message ?? `Successfully created ${slots.length} slot${slots.length !== 1 ? 's' : ''}!`,
          );
        }

        onSuccess?.();
      },
      onError: (error: unknown) => {
        let errorMessage = 'Failed to create slots';
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (error && typeof error === 'object') {
          if ('response' in error) {
            const apiError = error as {
              response?: {
                data?: { message?: string; error?: { code?: string } };
              };
            };
            errorMessage = apiError.response?.data?.message || errorMessage;
            // Handle specific error codes
            const errorCode = apiError.response?.data?.error?.code;
            if (errorCode === 'TIER_DAY_LIMIT_EXCEEDED') {
              const tierName = subscription?.plan?.displayName || 'your current';
              const dayLimit = subscription?.maxDaysPerWeek ?? null;
              const dayLimitText = dayLimit === null ? 'unlimited' : dayLimit.toString();
              errorMessage =
                apiError.response?.data?.message ||
                `Your ${tierName} tier allows a maximum of ${dayLimitText} days per week. You've already created slots for ${dayLimitText} days. Please upgrade your subscription or reduce the number of days.`;
            }
          } else if ('message' in error) {
            errorMessage = (error as { message: string }).message;
          }
        } else if (typeof error === 'string') {
          errorMessage = error;
        }
        toast.error(errorMessage);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Global Settings */}
      <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
        <h3 className="text-sm font-semibold text-charcoal">Global Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Location Type (Optional)</Label>
            <Select
              value={formData.locationType || 'default'}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  locationType: value === 'default' ? undefined : (value as LocationType),
                })
              }
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Default (Clinic)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default (Clinic)</SelectItem>
                <SelectItem value={LocationType.HOME}>Home Visit</SelectItem>
                <SelectItem value={LocationType.CLINIC}>Clinic</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Defaults to Clinic. Pricing determined during booking.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Base Price (€)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={formData.basePrice}
              onChange={(e) =>
                setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })
              }
              className={cn('h-9 text-xs', errors.price && 'border-error')}
            />
            {errors.price && <p className="text-xs text-error">{errors.price}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Slot Duration (min)</Label>
            <Select
              value={template.slotDuration.toString()}
              onValueChange={(value) => setTemplate({ ...template, slotDuration: parseInt(value) })}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 min</SelectItem>
                <SelectItem value="45">45 min</SelectItem>
                <SelectItem value="60">60 min</SelectItem>
                <SelectItem value="90">90 min</SelectItem>
                <SelectItem value="120">120 min</SelectItem>
              </SelectContent>
            </Select>
            {errors.slotDuration && <p className="text-xs text-error">{errors.slotDuration}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Break Duration (min)</Label>
            <Input
              type="number"
              min="0"
              step="5"
              value={template.breakDuration}
              onChange={(e) =>
                setTemplate({ ...template, breakDuration: parseInt(e.target.value) || 0 })
              }
              className={cn('h-9 text-xs', errors.breakDuration && 'border-error')}
            />
            {errors.breakDuration && <p className="text-xs text-error">{errors.breakDuration}</p>}
          </div>
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-charcoal">Weekly Schedule</h3>
        {errors.days && (
          <div className="p-2 bg-error/10 border border-error/20 rounded text-xs text-error">
            {errors.days}
          </div>
        )}
        <div className="space-y-2">
          {DAY_NAMES.map((day) => {
            const dayConfig = template.days[day.key];
            return (
              <div
                key={day.key}
                className="flex items-center gap-4 p-3 border rounded-lg bg-white hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-2 w-24">
                  <Checkbox
                    checked={dayConfig.enabled}
                    onCheckedChange={(checked) => updateDay(day.key, { enabled: checked === true })}
                  />
                  <Label className="text-sm font-medium">{day.label}</Label>
                </div>

                {dayConfig.enabled && (
                  <>
                    <div className="flex items-center gap-2 flex-1">
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs text-muted-foreground">Start Time</Label>
                        <Input
                          type="time"
                          value={dayConfig.startTime}
                          onChange={(e) => updateDay(day.key, { startTime: e.target.value })}
                          className="h-9 text-xs"
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs text-muted-foreground">End Time</Label>
                        <Input
                          type="time"
                          value={dayConfig.endTime}
                          onChange={(e) => updateDay(day.key, { endTime: e.target.value })}
                          className="h-9 text-xs"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Blocked Periods */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-charcoal">Blocked Time Periods</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addBlockedPeriod}
            className="h-8"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Blocked Period
          </Button>
        </div>
        {errors.blockedPeriods && (
          <div className="p-2 bg-error/10 border border-error/20 rounded text-xs text-error">
            {errors.blockedPeriods}
          </div>
        )}
        {template.blockedPeriods.length === 0 ? (
          <div className="text-center py-4 text-sm text-muted-foreground border rounded-lg">
            No blocked periods added. Click "Add Blocked Period" to block specific time slots.
          </div>
        ) : (
          <div className="space-y-2">
            {template.blockedPeriods.map((blockedPeriod) => (
              <div
                key={blockedPeriod.id}
                className="flex items-center gap-4 p-3 border rounded-lg bg-white hover:bg-muted/30 transition-colors"
              >
                <div className="flex-1 space-y-1">
                  <Label className="text-xs text-muted-foreground">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          'h-9 w-full justify-start text-left font-normal text-xs',
                          !blockedPeriod.date && 'text-muted-foreground',
                        )}
                      >
                        {blockedPeriod.date
                          ? blockedPeriod.date.toLocaleDateString()
                          : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={blockedPeriod.date}
                        onSelect={(date) => {
                          if (date) {
                            updateBlockedPeriod(blockedPeriod.id, {
                              date: startOfDay(date),
                            });
                          }
                        }}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex-1 space-y-1">
                  <Label className="text-xs text-muted-foreground">Start Time</Label>
                  <Input
                    type="time"
                    value={blockedPeriod.startTime}
                    onChange={(e) =>
                      updateBlockedPeriod(blockedPeriod.id, { startTime: e.target.value })
                    }
                    className="h-9 text-xs"
                  />
                </div>

                <div className="flex-1 space-y-1">
                  <Label className="text-xs text-muted-foreground">End Time</Label>
                  <Input
                    type="time"
                    value={blockedPeriod.endTime}
                    onChange={(e) =>
                      updateBlockedPeriod(blockedPeriod.id, { endTime: e.target.value })
                    }
                    className="h-9 text-xs"
                  />
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeBlockedPeriod(blockedPeriod.id)}
                  className="h-9 w-9 p-0 text-muted-foreground hover:text-error mt-6"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4 border-t">
        <Button type="submit" disabled={isCreating} className="h-10 px-6">
          {isCreating ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Generating Slots...
            </>
          ) : (
            'Generate & Save Slots'
          )}
        </Button>
      </div>
    </form>
  );
};
