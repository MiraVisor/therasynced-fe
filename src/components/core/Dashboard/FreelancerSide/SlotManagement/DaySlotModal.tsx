'use client';

import { addMinutes, format, isPast, isSameDay } from 'date-fns';
import { AlertTriangle, ArrowLeft, Check, Eye, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { DurationPricingSection } from '@/components/core/Dashboard/FreelancerSide/Pricing/DurationPricingSection';
import { PitchsidePricingSection } from '@/components/core/Dashboard/FreelancerSide/Pricing/PitchsidePricingSection';
import { ServicePricingSection } from '@/components/core/Dashboard/FreelancerSide/Pricing/ServicePricingSection';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
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
  useDeleteSlot,
  useSlotStats,
  useUpdateSlot,
} from '@/hooks/queries/useSlots';
import { cn } from '@/lib/utils';
import { CreateSlotsDto, Slot } from '@/types/types';

const DURATIONS = [30, 45, 60, 90, 120];

type Mode = 'manage' | 'create';
type CreateKind = 'single' | 'range';

const formatTime = (iso: string) => format(new Date(iso), 'h:mm a');

const toTimeInputValue = (iso: string) => format(new Date(iso), 'HH:mm');

const statusStyles = (status: Slot['status']) => {
  switch (status) {
    case 'BOOKED':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'RESERVED':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'AVAILABLE':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'CANCELLED':
      return 'bg-gray-50 text-gray-500 border-gray-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

interface DaySlotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  slots: Slot[];
  onViewSlot?: (slot: Slot) => void;
}

export const DaySlotModal = ({
  open,
  onOpenChange,
  date,
  slots,
  onViewSlot,
}: DaySlotModalProps) => {
  const daySlots = useMemo(() => {
    if (!date) return [];
    return slots
      .filter((s) => s.status !== 'CANCELLED' && isSameDay(new Date(s.startTime), date))
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [slots, date]);

  const hasSlots = daySlots.length > 0;

  const [mode, setMode] = useState<Mode>('manage');
  const [createKind, setCreateKind] = useState<CreateKind>('single');
  const [singleStartTime, setSingleStartTime] = useState('09:00');
  const [rangeStartTime, setRangeStartTime] = useState('09:00');
  const [rangeEndTime, setRangeEndTime] = useState('17:00');
  const [slotDuration, setSlotDuration] = useState(60);
  const [showAdvancedPricing, setShowAdvancedPricing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');

  useEffect(() => {
    if (open) {
      setMode(hasSlots ? 'manage' : 'create');
      setEditingSlotId(null);
    }
  }, [open, hasSlots, date]);

  const { data: pricingData, isLoading: isPricingLoading } = useFreelancerPricing();
  const { data: slotStats } = useSlotStats();
  const { mutate: createSlots, isPending: isCreating } = useCreateSlots();
  const { mutate: updateSlot, isPending: isUpdating } = useUpdateSlot();
  const { mutate: deleteSlotMutation, isPending: isDeletingOne } = useDeleteSlot();
  const { mutate: deleteDaySlots, isPending: isClearing } = useDeleteDaySlots();

  const currentDurationPrice = useMemo(() => {
    const p = pricingData?.durationPricing?.find((dp) => dp.duration === slotDuration);
    return p?.price ?? null;
  }, [pricingData, slotDuration]);

  const hasPricingConfigured = currentDurationPrice !== null && currentDurationPrice > 0;

  const dayPast = date ? isPast(date) && !isSameDay(date, new Date()) : false;

  const subInfo = slotStats?.subscriptionInfo;
  const capUsed = subInfo?.activeSlotsCount ?? 0;
  const capLimit = subInfo?.maxSlots ?? null;
  const capRemaining = subInfo?.remainingSlots ?? null;
  const capIsUnlimited = subInfo?.isUnlimited ?? capLimit === null;

  const availableCount = daySlots.filter((s) => s.status === 'AVAILABLE').length;
  const bookedCount = daySlots.filter(
    (s) => s.status === 'BOOKED' || s.status === 'RESERVED',
  ).length;

  // For create: generate the list of new slot time windows that would be created.
  // Used for overlap preview and count.
  const newSlotWindows = useMemo(() => {
    if (!date) return [] as Array<{ start: Date; end: Date }>;
    const windows: Array<{ start: Date; end: Date }> = [];
    const baseDate = new Date(date);
    baseDate.setHours(0, 0, 0, 0);

    if (createKind === 'single') {
      const [sh, sm] = singleStartTime.split(':').map(Number);
      if (sh === undefined || sm === undefined) return windows;
      const start = new Date(baseDate);
      start.setHours(sh, sm, 0, 0);
      const end = addMinutes(start, slotDuration);
      windows.push({ start, end });
    } else {
      const [sh, sm] = rangeStartTime.split(':').map(Number);
      const [eh, em] = rangeEndTime.split(':').map(Number);
      if (sh === undefined || sm === undefined || eh === undefined || em === undefined) {
        return windows;
      }
      const rangeStart = new Date(baseDate);
      rangeStart.setHours(sh, sm, 0, 0);
      const rangeEnd = new Date(baseDate);
      rangeEnd.setHours(eh, em, 0, 0);
      let cursor = rangeStart;
      while (addMinutes(cursor, slotDuration) <= rangeEnd) {
        const end = addMinutes(cursor, slotDuration);
        windows.push({ start: cursor, end });
        cursor = end;
      }
    }
    return windows;
  }, [createKind, singleStartTime, rangeStartTime, rangeEndTime, slotDuration, date]);

  const overlapCount = useMemo(() => {
    return newSlotWindows.filter((w) =>
      daySlots.some((s) => new Date(s.startTime) < w.end && new Date(s.endTime) > w.start),
    ).length;
  }, [newSlotWindows, daySlots]);

  const netNewCount = newSlotWindows.length - overlapCount;

  const handleCreate = () => {
    if (!date) return;

    let startTime: string;
    let endTime: string;

    if (createKind === 'single') {
      if (newSlotWindows.length === 0) return;
      const [sh, sm] = singleStartTime.split(':').map(Number);
      startTime = `${String(sh).padStart(2, '0')}:${String(sm).padStart(2, '0')}`;
      const totalMin = (sh ?? 0) * 60 + (sm ?? 0) + slotDuration;
      const eh = Math.floor(totalMin / 60);
      const em = totalMin % 60;
      endTime = `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
    } else {
      if (rangeStartTime >= rangeEndTime) {
        toast.error('End time must be after start time');
        return;
      }
      if (newSlotWindows.length === 0) {
        toast.error('No slots would be created with these settings');
        return;
      }
      startTime = rangeStartTime;
      endTime = rangeEndTime;
    }

    if (netNewCount === 0) {
      toast.error('All slots in this range overlap with existing ones');
      return;
    }

    const dto: CreateSlotsDto = {
      days: [format(date, 'yyyy-MM-dd')],
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
          toast.success(msg || `Created ${netNewCount} slot${netNewCount !== 1 ? 's' : ''}`);
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

  const handleDeleteSlot = (slot: Slot) => {
    if (slot.status === 'BOOKED' || slot.status === 'RESERVED') {
      toast.error('Booked slots cannot be deleted directly. Open the slot to cancel the booking.');
      return;
    }
    deleteSlotMutation(slot.id);
  };

  const handleClearDay = () => {
    if (!date) return;
    deleteDaySlots(
      { date: format(date, 'yyyy-MM-dd') },
      {
        onSuccess: () => {
          setShowClearConfirm(false);
          if (bookedCount === 0) onOpenChange(false);
        },
      },
    );
  };

  const startEditing = (slot: Slot) => {
    setEditingSlotId(slot.id);
    setEditStart(toTimeInputValue(slot.startTime));
    setEditEnd(toTimeInputValue(slot.endTime));
  };

  const cancelEditing = () => {
    setEditingSlotId(null);
  };

  const saveEditing = (slot: Slot) => {
    if (!date) return;
    if (editStart >= editEnd) {
      toast.error('End time must be after start time');
      return;
    }
    const baseDate = new Date(date);
    baseDate.setHours(0, 0, 0, 0);
    const [sh, sm] = editStart.split(':').map(Number);
    const [eh, em] = editEnd.split(':').map(Number);
    const newStart = new Date(baseDate);
    newStart.setHours(sh ?? 0, sm ?? 0, 0, 0);
    const newEnd = new Date(baseDate);
    newEnd.setHours(eh ?? 0, em ?? 0, 0, 0);

    updateSlot(
      {
        id: slot.id,
        startTime: newStart.toISOString(),
        endTime: newEnd.toISOString(),
      },
      {
        onSuccess: () => {
          setEditingSlotId(null);
        },
      },
    );
  };

  const title = date ? format(date, 'EEEE, MMM d') : 'Slots';
  const subtitle = hasSlots
    ? `${availableCount} available · ${bookedCount} booked`
    : 'No slots yet';

  const capChip = !capIsUnlimited && capLimit !== null && (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
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
        slot{capLimit === 1 ? '' : 's'} used
        {capRemaining !== null && capRemaining > 0 && ` · ${capRemaining} left`}
      </span>
    </div>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>{subtitle}</DialogDescription>
              </div>
              {capChip}
            </div>
          </DialogHeader>

          {mode === 'manage' ? (
            <div className="space-y-4 pt-2">
              {hasSlots ? (
                <div className="space-y-1.5 max-h-[50vh] overflow-y-auto pr-1">
                  {daySlots.map((slot) => {
                    const isBooked = slot.status === 'BOOKED' || slot.status === 'RESERVED';
                    const isEditing = editingSlotId === slot.id;

                    return (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors"
                      >
                        {isEditing ? (
                          <>
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <Input
                                type="time"
                                value={editStart}
                                onChange={(e) => setEditStart(e.target.value)}
                                className="h-8 w-28"
                              />
                              <span className="text-muted-foreground text-xs">to</span>
                              <Input
                                type="time"
                                value={editEnd}
                                onChange={(e) => setEditEnd(e.target.value)}
                                className="h-8 w-28"
                              />
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => saveEditing(slot)}
                                disabled={isUpdating}
                                className="text-primary hover:bg-primary/10"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={cancelEditing}
                                disabled={isUpdating}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-foreground">
                                  {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                                </span>
                                {slot.booking?.client?.name && (
                                  <span className="text-xs text-muted-foreground truncate">
                                    {slot.booking.client.name}
                                  </span>
                                )}
                              </div>
                              <Badge
                                variant="outline"
                                className={cn('text-[10px] uppercase', statusStyles(slot.status))}
                              >
                                {slot.status.toLowerCase()}
                              </Badge>
                              <span className="text-xs text-muted-foreground ml-auto tabular-nums">
                                €{slot.basePrice}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {isBooked ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onViewSlot?.(slot)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              ) : (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => startEditing(slot)}
                                    disabled={dayPast}
                                    className="text-muted-foreground hover:text-primary"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteSlot(slot)}
                                    disabled={isDeletingOne}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed rounded-lg">
                  <p className="text-sm text-muted-foreground">No slots for this day</p>
                </div>
              )}

              <div className="flex items-center justify-between gap-2 pt-2 border-t">
                {availableCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowClearConfirm(true)}
                    disabled={isClearing}
                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4 mr-1.5" />
                    Clear available
                  </Button>
                )}
                {!dayPast && (
                  <Button size="sm" onClick={() => setMode('create')} className="ml-auto">
                    <Plus className="h-4 w-4 mr-1.5" />
                    Add slots
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {hasSlots && (
                <button
                  onClick={() => setMode('manage')}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back to slots
                </button>
              )}

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
                        value={rangeStartTime}
                        onChange={(e) => setRangeStartTime(e.target.value)}
                        className="w-full"
                      />
                      <span className="text-muted-foreground text-xs shrink-0">to</span>
                      <Input
                        type="time"
                        value={rangeEndTime}
                        onChange={(e) => setRangeEndTime(e.target.value)}
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

              <div className="border rounded-lg p-3 bg-muted/30 space-y-2">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-lg font-semibold">{netNewCount}</span>
                    <span className="text-muted-foreground ml-1.5 text-sm">
                      slot{netNewCount !== 1 ? 's' : ''} will be created
                    </span>
                  </div>
                  {hasPricingConfigured && netNewCount > 0 && (
                    <span className="text-sm font-medium">
                      €{(netNewCount * (currentDurationPrice || 0)).toFixed(0)}
                    </span>
                  )}
                </div>
                {overlapCount > 0 && (
                  <p className="text-xs text-amber-600">
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
              </div>

              <Button
                className="w-full"
                onClick={handleCreate}
                disabled={
                  netNewCount === 0 ||
                  !hasPricingConfigured ||
                  isCreating ||
                  dayPast ||
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
            </div>
          )}
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

      <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear all available slots?</DialogTitle>
            <DialogDescription>
              This will delete {availableCount} available slot
              {availableCount !== 1 ? 's' : ''} on {date ? format(date, 'EEEE, MMM d') : 'this day'}
              . Booked slots are not affected.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowClearConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearDay} disabled={isClearing}>
              {isClearing ? 'Clearing...' : 'Clear'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
