'use client';

import {
  addDays,
  addWeeks,
  endOfWeek,
  format,
  isPast,
  isSameDay,
  startOfWeek,
  subWeeks,
} from 'date-fns';
import { AlertTriangle, Calendar, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { DurationPricingSection } from '@/components/core/Dashboard/FreelancerSide/Pricing/DurationPricingSection';
import { PitchsidePricingSection } from '@/components/core/Dashboard/FreelancerSide/Pricing/PitchsidePricingSection';
import { ServicePricingSection } from '@/components/core/Dashboard/FreelancerSide/Pricing/ServicePricingSection';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useFreelancerPricing } from '@/hooks/queries/usePricing';
import {
  useCreateSlots,
  useDeleteDaySlots,
  useLastWeekPattern,
  useMySlots,
} from '@/hooks/queries/useSlots';
import { useMySubscription } from '@/hooks/queries/useSubscription';
import { useAuth } from '@/hooks/useAuthZustand';
import { cn } from '@/lib/utils';
import { CreateSlotsDto } from '@/types/types';
import { getMaxDaysForTier, getTierFromSubscription } from '@/utils/tierUtils';

const DAYS = [
  { key: 'monday', label: 'Mon', full: 'Monday' },
  { key: 'tuesday', label: 'Tue', full: 'Tuesday' },
  { key: 'wednesday', label: 'Wed', full: 'Wednesday' },
  { key: 'thursday', label: 'Thu', full: 'Thursday' },
  { key: 'friday', label: 'Fri', full: 'Friday' },
  { key: 'saturday', label: 'Sat', full: 'Saturday' },
  { key: 'sunday', label: 'Sun', full: 'Sunday' },
] as const;

const DURATIONS = [30, 45, 60, 90, 120];

const AvailabilityPage = () => {
  const { role } = useAuth();

  // Week navigation
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );
  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });

  // Subscription & limits
  const { data: currentSubscription } = useMySubscription();
  const tier = getTierFromSubscription(currentSubscription || null);
  const isTrialing = currentSubscription?.status === 'TRIALING' || currentSubscription?.isInTrial;

  const maxDaysPerWeek = useMemo(() => {
    if (isTrialing) return 7;
    if (currentSubscription?.maxDaysPerWeek === null) return 7;
    if (currentSubscription?.maxDaysPerWeek && currentSubscription.maxDaysPerWeek > 0) {
      return currentSubscription.maxDaysPerWeek;
    }
    const tierLimit = getMaxDaysForTier(tier);
    return tierLimit > 0 ? tierLimit : 7;
  }, [currentSubscription, tier, isTrialing]);

  // Form state - simplified
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [slotDuration, setSlotDuration] = useState(60);
  const [showAdvancedPricing, setShowAdvancedPricing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Data hooks
  const { data: pricingData, isLoading: isPricingLoading } = useFreelancerPricing();
  const { mutate: createSlots, isPending: isCreating } = useCreateSlots();
  const { mutate: deleteDaySlots, isPending: isDeleting } = useDeleteDaySlots();
  const { data: lastWeekPattern } = useLastWeekPattern({
    weekStart: format(addDays(currentWeekStart, -7), 'yyyy-MM-dd'),
  });

  // Fetch existing slots
  const { data: existingSlots = [] } = useMySlots({
    page: 1,
    limit: 500,
    weekStart: format(currentWeekStart, "yyyy-MM-dd'T'00:00:00"),
    weekEnd: format(weekEnd, "yyyy-MM-dd'T'23:59:59"),
    sortBy: 'startTime',
    sortOrder: 'asc',
  });

  // Group slots by day
  const slotsByDay = useMemo(() => {
    const grouped: Record<string, typeof existingSlots> = {};
    DAYS.forEach(({ key }) => {
      grouped[key] = [];
    });
    existingSlots.forEach((slot) => {
      const dayIndex = new Date(slot.startTime).getDay();
      const dayKey = DAYS[(dayIndex + 6) % 7]?.key;
      if (dayKey && grouped[dayKey]) grouped[dayKey].push(slot);
    });
    return grouped;
  }, [existingSlots]);

  // Current duration price from saved pricing
  const currentDurationPrice = useMemo(() => {
    const p = pricingData?.durationPricing?.find((dp) => dp.duration === slotDuration);
    return p?.price ?? null;
  }, [pricingData, slotDuration]);

  const hasPricingConfigured = currentDurationPrice !== null && currentDurationPrice > 0;

  // Week navigation
  const navigateWeek = (dir: 'prev' | 'next') => {
    setCurrentWeekStart((prev) => (dir === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1)));
    setSelectedDays([]); // Clear selection when changing weeks
  };

  const isCurrentWeek = useMemo(() => {
    return currentWeekStart.getTime() === startOfWeek(new Date(), { weekStartsOn: 1 }).getTime();
  }, [currentWeekStart]);

  // Toggle day selection
  const toggleDay = (day: string) => {
    setSelectedDays((prev) => {
      if (prev.includes(day)) return prev.filter((d) => d !== day);
      if (prev.length >= maxDaysPerWeek) {
        toast.warning(`Your plan allows max ${maxDaysPerWeek} days/week`);
        return prev;
      }
      return [...prev, day];
    });
  };

  // Quick select buttons
  const selectAllWeekdays = () => {
    const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const today = new Date();
    const futureDays = weekdays.filter((day) => {
      const dayIndex = DAYS.findIndex((d) => d.key === day);
      const date = addDays(currentWeekStart, dayIndex);
      return !isPast(date) || isSameDay(date, today);
    });
    setSelectedDays(futureDays.slice(0, maxDaysPerWeek));
  };

  const selectAllDays = () => {
    const today = new Date();
    const futureDays = DAYS.filter((_, i) => {
      const date = addDays(currentWeekStart, i);
      return !isPast(date) || isSameDay(date, today);
    }).map((d) => d.key);
    setSelectedDays(futureDays.slice(0, maxDaysPerWeek));
  };

  const clearSelection = () => setSelectedDays([]);

  // Copy last week pattern
  const copyLastWeek = () => {
    if (!lastWeekPattern?.hasPattern) return;
    const { pattern } = lastWeekPattern;
    const days = Object.entries(pattern)
      .filter(([_, p]) => p.enabled)
      .map(([d]) => d);
    if (days.length === 0) return;

    // Filter to only future days in the current week
    const today = new Date();
    const futureDays = days.filter((day) => {
      const dayIndex = DAYS.findIndex((d) => d.key === day);
      const date = addDays(currentWeekStart, dayIndex);
      return !isPast(date) || isSameDay(date, today);
    });

    setSelectedDays(futureDays.slice(0, maxDaysPerWeek));
    setSlotDuration(lastWeekPattern.mostCommonDuration || 60);
    setStartTime(lastWeekPattern.mostCommonStartTime || '09:00');
    setEndTime(lastWeekPattern.mostCommonEndTime || '17:00');
    toast.success("Copied last week's schedule");
  };

  // Calculate slot count (simplified - no breaks)
  const slotCount = useMemo(() => {
    if (selectedDays.length === 0) return 0;
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const mins = (eh ?? 0) * 60 + (em ?? 0) - ((sh ?? 0) * 60 + (sm ?? 0));
    return Math.max(0, Math.floor(mins / slotDuration) * selectedDays.length);
  }, [selectedDays, startTime, endTime, slotDuration]);

  const revenue = slotCount * (currentDurationPrice || 0);

  // Convert selected day keys to actual dates
  const getSelectedDates = (): string[] => {
    return selectedDays
      .map((dayKey) => {
        const dayIndex = DAYS.findIndex((d) => d.key === dayKey);
        if (dayIndex === -1) return null;
        const date = addDays(currentWeekStart, dayIndex);
        // Skip past dates
        const today = new Date();
        if (isPast(date) && !isSameDay(date, today)) return null;
        return format(date, 'yyyy-MM-dd');
      })
      .filter((d): d is string => d !== null);
  };

  // Submit
  const handleSubmit = () => {
    if (selectedDays.length === 0) {
      toast.error('Select at least one day');
      return;
    }
    if (startTime >= endTime) {
      toast.error('End time must be after start time');
      return;
    }

    const dates = getSelectedDates();
    if (dates.length === 0) {
      toast.error('No valid days selected');
      return;
    }

    const dto: CreateSlotsDto = {
      days: dates,
      startTime,
      endTime,
      duration: slotDuration,
    };

    createSlots(dto, {
      onSuccess: (res) => {
        const msg = res.message || '';
        if (msg.toLowerCase().includes('skipped')) {
          toast.warning(msg);
        } else {
          toast.success(msg || `Created slots successfully`);
        }
        setSelectedDays([]); // Clear selection after success
      },
      onError: (e: unknown) => {
        const msg =
          e && typeof e === 'object' && 'message' in e
            ? (e as { message: string }).message
            : 'Failed to create slots';
        toast.error(msg);
      },
    });
  };

  // Clear all slots for the week
  const handleClearWeek = () => {
    const dates = DAYS.map((_, i) => {
      const date = addDays(currentWeekStart, i);
      const today = new Date();
      if (isPast(date) && !isSameDay(date, today)) return null;
      return format(date, 'yyyy-MM-dd');
    }).filter((d): d is string => d !== null);

    if (dates.length === 0) {
      toast.info('No days to clear');
      return;
    }

    // Delete each day's slots
    let deleted = 0;
    dates.forEach((date) => {
      deleteDaySlots(
        { date },
        {
          onSuccess: (res) => {
            deleted += res.data?.deletedCount || 0;
          },
        },
      );
    });

    setShowClearConfirm(false);
    toast.success('Clearing slots...');
  };

  const isSubmitting = isCreating;

  return (
    <DashboardPageWrapper
      userRole={role}
      header={
        <div className="flex items-center justify-between w-full">
          <div>
            <h2 className="text-2xl font-poppins font-bold text-charcoal">Availability</h2>
            <p className="text-muted-foreground text-sm">Create and manage your schedule</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/slots">
              <Calendar className="h-4 w-4 mr-1.5" />
              View All Slots
            </Link>
          </Button>
        </div>
      }
    >
      <div className="max-w-4xl space-y-6 pb-8">
        {/* Week Selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => navigateWeek('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <button
              onClick={() => {
                setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
                setSelectedDays([]);
              }}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                isCurrentWeek ? 'bg-primary text-white' : 'hover:bg-muted',
              )}
            >
              {isCurrentWeek
                ? 'This Week'
                : `${format(currentWeekStart, 'MMM d')} – ${format(weekEnd, 'MMM d')}`}
            </button>
            <Button variant="ghost" size="sm" onClick={() => navigateWeek('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          {lastWeekPattern?.hasPattern && (
            <button onClick={copyLastWeek} className="text-sm text-primary hover:underline">
              Copy last week
            </button>
          )}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {DAYS.map(({ key, label }, i) => {
            const date = addDays(currentWeekStart, i);
            const isSelected = selectedDays.includes(key);
            const isToday = isSameDay(date, new Date());
            const dayPast = isPast(date) && !isToday;
            const slots = slotsByDay[key] || [];
            const available = slots.filter((s) => s.status === 'AVAILABLE').length;
            const booked = slots.filter((s) => s.status === 'BOOKED').length;

            return (
              <button
                key={key}
                type="button"
                onClick={() => !dayPast && toggleDay(key)}
                disabled={dayPast}
                className={cn(
                  'relative flex flex-col items-center p-3 rounded-lg border transition-all text-left',
                  'hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20',
                  isSelected && 'bg-primary/5 border-primary ring-1 ring-primary/30',
                  !isSelected && 'border-border bg-card',
                  dayPast && 'opacity-40 cursor-not-allowed hover:border-border',
                  isToday && !isSelected && 'border-primary/40',
                )}
              >
                <span
                  className={cn(
                    'text-[11px] uppercase tracking-wide',
                    isSelected ? 'text-primary font-medium' : 'text-muted-foreground',
                  )}
                >
                  {label}
                </span>
                <span
                  className={cn(
                    'text-lg font-semibold mt-0.5',
                    isSelected ? 'text-primary' : 'text-foreground',
                    isToday && 'underline underline-offset-2',
                  )}
                >
                  {format(date, 'd')}
                </span>

                {slots.length > 0 && (
                  <div className="mt-2 text-[10px] space-y-0.5 w-full text-center">
                    {available > 0 && (
                      <div className="text-emerald-600 font-medium">{available} open</div>
                    )}
                    {booked > 0 && (
                      <div className="text-amber-600 font-medium">{booked} booked</div>
                    )}
                  </div>
                )}

                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Select Buttons */}
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={selectAllWeekdays}>
            All Weekdays
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={selectAllDays}>
            All Days
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearSelection}
            disabled={selectedDays.length === 0}
          >
            Clear
          </Button>
        </div>

        {/* Create Slots Form */}
        <div className="border rounded-lg p-5 space-y-5 bg-card">
          <h3 className="font-medium text-foreground">Create Slots</h3>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Time Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Time Range</label>
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full"
                />
                <span className="text-muted-foreground text-sm shrink-0">to</span>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Session Duration */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Session Duration</label>
              <div className="flex gap-1.5">
                {DURATIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSlotDuration(d)}
                    className={cn(
                      'flex-1 py-2 text-sm font-medium rounded-md border transition-colors',
                      slotDuration === d
                        ? 'bg-primary text-white border-primary'
                        : 'border-border hover:border-primary/50',
                    )}
                  >
                    {d}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing Status */}
          {!isPricingLoading && !hasPricingConfigured && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No pricing configured for {slotDuration}-minute sessions.{' '}
                <button
                  type="button"
                  onClick={() => setShowAdvancedPricing(true)}
                  className="underline font-medium"
                >
                  Configure pricing
                </button>
              </AlertDescription>
            </Alert>
          )}

          {hasPricingConfigured && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Price per session:{' '}
                <span className="text-foreground font-medium">€{currentDurationPrice}</span>
              </span>
              <button
                type="button"
                onClick={() => setShowAdvancedPricing(true)}
                className="text-primary hover:underline"
              >
                Edit pricing
              </button>
            </div>
          )}

          {/* Preview */}
          <div className="pt-3 border-t">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-semibold">{slotCount}</span>
                <span className="text-muted-foreground ml-1.5">
                  slot{slotCount !== 1 ? 's' : ''} will be created
                  {hasPricingConfigured &&
                    ` (${Math.floor(slotCount / Math.max(1, selectedDays.length))} per day)`}
                </span>
              </div>
              {hasPricingConfigured && slotCount > 0 && (
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Potential revenue</div>
                  <div className="text-xl font-semibold">€{revenue.toFixed(0)}</div>
                </div>
              )}
            </div>

            {selectedDays.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                {selectedDays.map((d) => DAYS.find((day) => day.key === d)?.full).join(', ')}
                {' · '}
                {startTime}–{endTime}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleSubmit}
            disabled={
              selectedDays.length === 0 || slotCount === 0 || !hasPricingConfigured || isSubmitting
            }
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Creating...
              </>
            ) : (
              `Create ${slotCount} Slot${slotCount !== 1 ? 's' : ''}`
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            This will replace existing available slots for selected days. Booked slots are never
            affected.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowClearConfirm(true)}
            disabled={
              existingSlots.filter((s) => s.status === 'AVAILABLE').length === 0 || isDeleting
            }
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            Clear Week
          </Button>
        </div>
      </div>

      {/* Advanced Pricing Modal */}
      <Dialog open={showAdvancedPricing} onOpenChange={setShowAdvancedPricing}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pricing Settings</DialogTitle>
            <DialogDescription>Configure your session prices</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <DurationPricingSection />
            <ServicePricingSection />
            <PitchsidePricingSection />
          </div>
        </DialogContent>
      </Dialog>

      {/* Clear Week Confirmation */}
      <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear All Available Slots?</DialogTitle>
            <DialogDescription>
              This will delete all your available slots for this week. Booked slots will not be
              affected.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowClearConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearWeek} disabled={isDeleting}>
              {isDeleting ? 'Clearing...' : 'Clear Week'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardPageWrapper>
  );
};

export default AvailabilityPage;
