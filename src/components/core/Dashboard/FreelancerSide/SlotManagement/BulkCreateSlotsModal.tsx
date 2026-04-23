'use client';

import { addDays, addMinutes, format, isPast, isSameDay } from 'date-fns';
import { AlertTriangle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

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
  useLastWeekPattern,
  useMySlots,
  useSlotStats,
} from '@/hooks/queries/useSlots';
import { useMySubscription } from '@/hooks/queries/useSubscription';
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

interface BulkCreateSlotsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weekStart: Date;
}

export const BulkCreateSlotsModal = ({
  open,
  onOpenChange,
  weekStart,
}: BulkCreateSlotsModalProps) => {
  const weekEnd = addDays(weekStart, 6);

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

  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [createKind, setCreateKind] = useState<'single' | 'range'>('range');
  const [singleStartTime, setSingleStartTime] = useState('09:00');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [slotDuration, setSlotDuration] = useState(60);
  const [showAdvancedPricing, setShowAdvancedPricing] = useState(false);

  useEffect(() => {
    if (!open) {
      setSelectedDays([]);
    }
  }, [open]);

  const { data: pricingData, isLoading: isPricingLoading } = useFreelancerPricing();
  const { data: slotStats } = useSlotStats();
  const { mutate: createSlots, isPending: isCreating } = useCreateSlots();
  const { data: lastWeekPattern } = useLastWeekPattern({
    weekStart: format(addDays(weekStart, -7), 'yyyy-MM-dd'),
  });

  const subInfo = slotStats?.subscriptionInfo;
  const capUsed = subInfo?.activeSlotsCount ?? 0;
  const capLimit = subInfo?.maxSlots ?? null;
  const capRemaining = subInfo?.remainingSlots ?? null;
  const capIsUnlimited = subInfo?.isUnlimited ?? capLimit === null;

  const { data: existingSlots = [] } = useMySlots({
    page: 1,
    limit: 500,
    weekStart: format(weekStart, "yyyy-MM-dd'T'00:00:00"),
    weekEnd: format(weekEnd, "yyyy-MM-dd'T'23:59:59"),
    sortBy: 'startTime',
    sortOrder: 'asc',
  });

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

  const currentDurationPrice = useMemo(() => {
    const p = pricingData?.durationPricing?.find((dp) => dp.duration === slotDuration);
    return p?.price ?? null;
  }, [pricingData, slotDuration]);

  const hasPricingConfigured = currentDurationPrice !== null && currentDurationPrice > 0;

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

  const selectAllWeekdays = () => {
    const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const today = new Date();
    const futureDays = weekdays.filter((day) => {
      const dayIndex = DAYS.findIndex((d) => d.key === day);
      const date = addDays(weekStart, dayIndex);
      return !isPast(date) || isSameDay(date, today);
    });
    setSelectedDays(futureDays.slice(0, maxDaysPerWeek));
  };

  const selectAllDays = () => {
    const today = new Date();
    const futureDays = DAYS.filter((_, i) => {
      const date = addDays(weekStart, i);
      return !isPast(date) || isSameDay(date, today);
    }).map((d) => d.key);
    setSelectedDays(futureDays.slice(0, maxDaysPerWeek));
  };

  const clearSelection = () => setSelectedDays([]);

  const copyLastWeek = () => {
    if (!lastWeekPattern?.hasPattern) return;
    const { pattern } = lastWeekPattern;
    const days = Object.entries(pattern)
      .filter(([_, p]) => p.enabled)
      .map(([d]) => d);
    if (days.length === 0) return;

    const today = new Date();
    const futureDays = days.filter((day) => {
      const dayIndex = DAYS.findIndex((d) => d.key === day);
      const date = addDays(weekStart, dayIndex);
      return !isPast(date) || isSameDay(date, today);
    });

    setSelectedDays(futureDays.slice(0, maxDaysPerWeek));
    setSlotDuration(lastWeekPattern.mostCommonDuration || 60);
    setStartTime(lastWeekPattern.mostCommonStartTime || '09:00');
    setEndTime(lastWeekPattern.mostCommonEndTime || '17:00');
    toast.success("Copied last week's schedule");
  };

  const slotCount = useMemo(() => {
    if (selectedDays.length === 0) return 0;
    if (createKind === 'single') return selectedDays.length;
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const mins = (eh ?? 0) * 60 + (em ?? 0) - ((sh ?? 0) * 60 + (sm ?? 0));
    return Math.max(0, Math.floor(mins / slotDuration) * selectedDays.length);
  }, [selectedDays, startTime, endTime, slotDuration, createKind]);

  const overlapCount = useMemo(() => {
    if (selectedDays.length === 0) return 0;

    const effectiveStart = createKind === 'single' ? singleStartTime : startTime;
    const [sh, sm] = effectiveStart.split(':').map(Number);
    if (sh === undefined || sm === undefined) return 0;

    let overlaps = 0;
    for (const dayKey of selectedDays) {
      const daySlotList = slotsByDay[dayKey] ?? [];
      const activeDaySlots = daySlotList.filter((s) => s.status !== 'CANCELLED');
      const dayIndex = DAYS.findIndex((d) => d.key === dayKey);
      if (dayIndex === -1) continue;
      const base = addDays(weekStart, dayIndex);
      base.setHours(0, 0, 0, 0);

      if (createKind === 'single') {
        const slotStart = new Date(base);
        slotStart.setHours(sh, sm, 0, 0);
        const slotEnd = addMinutes(slotStart, slotDuration);
        const hasOverlap = activeDaySlots.some(
          (s) => new Date(s.startTime) < slotEnd && new Date(s.endTime) > slotStart,
        );
        if (hasOverlap) overlaps += 1;
      } else {
        const [eh, em] = endTime.split(':').map(Number);
        if (eh === undefined || em === undefined) continue;
        const rangeStart = new Date(base);
        rangeStart.setHours(sh, sm, 0, 0);
        const rangeEnd = new Date(base);
        rangeEnd.setHours(eh, em, 0, 0);
        let cursor = rangeStart;
        while (addMinutes(cursor, slotDuration) <= rangeEnd) {
          const end = addMinutes(cursor, slotDuration);
          const hasOverlap = activeDaySlots.some(
            (s) => new Date(s.startTime) < end && new Date(s.endTime) > cursor,
          );
          if (hasOverlap) overlaps += 1;
          cursor = end;
        }
      }
    }
    return overlaps;
  }, [
    selectedDays,
    slotsByDay,
    createKind,
    singleStartTime,
    startTime,
    endTime,
    slotDuration,
    weekStart,
  ]);

  const netNewCount = Math.max(0, slotCount - overlapCount);
  const revenue = netNewCount * (currentDurationPrice || 0);

  const getSelectedDates = (): string[] => {
    return selectedDays
      .map((dayKey) => {
        const dayIndex = DAYS.findIndex((d) => d.key === dayKey);
        if (dayIndex === -1) return null;
        const date = addDays(weekStart, dayIndex);
        const today = new Date();
        if (isPast(date) && !isSameDay(date, today)) return null;
        return format(date, 'yyyy-MM-dd');
      })
      .filter((d): d is string => d !== null);
  };

  const handleSubmit = () => {
    if (selectedDays.length === 0) {
      toast.error('Select at least one day');
      return;
    }

    const dates = getSelectedDates();
    if (dates.length === 0) {
      toast.error('No valid days selected');
      return;
    }

    let effectiveStart: string;
    let effectiveEnd: string;

    if (createKind === 'single') {
      const [sh, sm] = singleStartTime.split(':').map(Number);
      effectiveStart = `${String(sh).padStart(2, '0')}:${String(sm).padStart(2, '0')}`;
      const totalMin = (sh ?? 0) * 60 + (sm ?? 0) + slotDuration;
      const eh = Math.floor(totalMin / 60);
      const em = totalMin % 60;
      effectiveEnd = `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
    } else {
      if (startTime >= endTime) {
        toast.error('End time must be after start time');
        return;
      }
      effectiveStart = startTime;
      effectiveEnd = endTime;
    }

    const dto: CreateSlotsDto = {
      days: dates,
      startTime: effectiveStart,
      endTime: effectiveEnd,
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
        onOpenChange(false);
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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <DialogTitle>Create Slots</DialogTitle>
                <DialogDescription>
                  Pick days, set your hours, and publish your availability.
                </DialogDescription>
              </div>
              {!capIsUnlimited && capLimit !== null && (
                <div
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border shrink-0',
                    capRemaining !== null && capRemaining <= 0
                      ? 'bg-destructive/10 text-destructive border-destructive/30'
                      : capRemaining !== null && capRemaining <= 2
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-muted text-muted-foreground border-border',
                  )}
                >
                  <span className="tabular-nums">
                    {capUsed} / {capLimit}
                  </span>
                  <span>
                    used
                    {capRemaining !== null && capRemaining > 0 && ` · ${capRemaining} left`}
                  </span>
                </div>
              )}
            </div>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Week of {format(weekStart, 'MMM d')} – {format(weekEnd, 'MMM d')}
              </p>
              {lastWeekPattern?.hasPattern && (
                <button onClick={copyLastWeek} className="text-sm text-primary hover:underline">
                  Copy last week
                </button>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-bold text-primary bg-primary/10 rounded-full w-5 h-5 inline-flex items-center justify-center shrink-0">
                    1
                  </span>
                  <h3 className="font-medium text-foreground">Pick your days</h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button type="button" variant="outline" size="sm" onClick={selectAllWeekdays}>
                    Weekdays
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={selectAllDays}>
                    All
                  </Button>
                  {selectedDays.length > 0 && (
                    <Button type="button" variant="ghost" size="sm" onClick={clearSelection}>
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {DAYS.map(({ key, label }, i) => {
                  const date = addDays(weekStart, i);
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
                        'relative flex flex-col items-center p-2.5 rounded-lg border transition-all text-left',
                        'hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20',
                        isSelected && 'bg-primary/5 border-primary ring-1 ring-primary/30',
                        !isSelected && 'border-border bg-card',
                        dayPast && 'opacity-40 cursor-not-allowed hover:border-border',
                        isToday && !isSelected && 'border-primary/40',
                      )}
                    >
                      <span
                        className={cn(
                          'text-[10px] uppercase tracking-wide',
                          isSelected ? 'text-primary font-medium' : 'text-muted-foreground',
                        )}
                      >
                        {label}
                      </span>
                      <span
                        className={cn(
                          'text-base font-semibold mt-0.5',
                          isSelected ? 'text-primary' : 'text-foreground',
                          isToday && 'underline underline-offset-2',
                        )}
                      >
                        {format(date, 'd')}
                      </span>

                      {slots.length > 0 && (
                        <div className="mt-1 text-[9px] w-full text-center">
                          {available > 0 && (
                            <div className="text-emerald-600 font-medium">{available} open</div>
                          )}
                          {booked > 0 && (
                            <div className="text-amber-600 font-medium">{booked} bkd</div>
                          )}
                        </div>
                      )}

                      {isSelected && (
                        <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              className={cn(
                'border rounded-lg p-4 space-y-4 bg-card transition-opacity',
                selectedDays.length === 0 && 'opacity-50 pointer-events-none',
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-bold text-primary bg-primary/10 rounded-full w-5 h-5 inline-flex items-center justify-center shrink-0">
                    2
                  </span>
                  <h3 className="font-medium text-foreground">Set your hours</h3>
                </div>
                <div className="inline-flex items-center gap-0.5 p-0.5 rounded-lg bg-muted">
                  <button
                    type="button"
                    onClick={() => setCreateKind('single')}
                    className={cn(
                      'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                      createKind === 'single'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    Single slot
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateKind('range')}
                    className={cn(
                      'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                      createKind === 'range'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    Time range
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {createKind === 'single' ? (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Start time</label>
                    <Input
                      type="time"
                      value={singleStartTime}
                      onChange={(e) => setSingleStartTime(e.target.value)}
                      className="w-full"
                    />
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Time range</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full"
                      />
                      <span className="text-muted-foreground text-xs shrink-0">to</span>
                      <Input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Session Duration</label>
                  <div className="flex gap-1">
                    {DURATIONS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setSlotDuration(d)}
                        className={cn(
                          'flex-1 py-1.5 text-xs font-medium rounded-md border transition-colors',
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
                    className="text-primary hover:underline text-xs"
                  >
                    Edit pricing
                  </button>
                </div>
              )}
            </div>

            <div
              className={cn(
                'border rounded-lg p-4 space-y-3 bg-card transition-opacity',
                (selectedDays.length === 0 || slotCount === 0 || !hasPricingConfigured) &&
                  'opacity-50 pointer-events-none',
              )}
            >
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-bold text-primary bg-primary/10 rounded-full w-5 h-5 inline-flex items-center justify-center shrink-0">
                  3
                </span>
                <h3 className="font-medium text-foreground">Review & create</h3>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xl font-semibold">{netNewCount}</span>
                  <span className="text-muted-foreground ml-1.5 text-sm">
                    slot{netNewCount !== 1 ? 's' : ''} will be created
                  </span>
                </div>
                {hasPricingConfigured && netNewCount > 0 && (
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Potential revenue</div>
                    <div className="text-lg font-semibold">€{revenue.toFixed(0)}</div>
                  </div>
                )}
              </div>

              {overlapCount > 0 && (
                <p className="text-xs text-amber-600 dark:text-amber-500">
                  {overlapCount} slot{overlapCount !== 1 ? 's' : ''} will be skipped (overlap with
                  existing)
                </p>
              )}
              {!capIsUnlimited && capRemaining !== null && netNewCount > capRemaining && (
                <p className="text-xs text-destructive">
                  Only {capRemaining} slot{capRemaining !== 1 ? 's' : ''} left on your plan —
                  creation will be rejected.
                </p>
              )}

              {selectedDays.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {selectedDays.map((d) => DAYS.find((day) => day.key === d)?.full).join(', ')}
                  {' · '}
                  {startTime}–{endTime} · {slotDuration}min sessions
                </p>
              )}

              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmit}
                disabled={
                  selectedDays.length === 0 ||
                  netNewCount === 0 ||
                  !hasPricingConfigured ||
                  isCreating ||
                  (!capIsUnlimited && capRemaining !== null && netNewCount > capRemaining)
                }
              >
                {isCreating ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Creating...
                  </>
                ) : (
                  `Create ${netNewCount} Slot${netNewCount !== 1 ? 's' : ''}`
                )}
              </Button>

              <p className="text-[11px] text-muted-foreground text-center">
                New slots are added alongside existing ones. Overlapping times are skipped.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
    </>
  );
};
