'use client';

import { format, isPast, isSameDay } from 'date-fns';
import { AlertTriangle, ArrowLeft, Eye, Plus, Trash2 } from 'lucide-react';
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
import { useCreateSlots, useDeleteDaySlots, useDeleteSlot } from '@/hooks/queries/useSlots';
import { cn } from '@/lib/utils';
import { CreateSlotsDto, Slot } from '@/types/types';

const DURATIONS = [30, 45, 60, 90, 120];

type Mode = 'manage' | 'create';

const formatTime = (iso: string) => format(new Date(iso), 'h:mm a');

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
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [slotDuration, setSlotDuration] = useState(60);
  const [showAdvancedPricing, setShowAdvancedPricing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    if (open) {
      setMode(hasSlots ? 'manage' : 'create');
    }
  }, [open, hasSlots, date]);

  const { data: pricingData, isLoading: isPricingLoading } = useFreelancerPricing();
  const { mutate: createSlots, isPending: isCreating } = useCreateSlots();
  const { mutate: deleteSlotMutation, isPending: isDeletingOne } = useDeleteSlot();
  const { mutate: deleteDaySlots, isPending: isClearing } = useDeleteDaySlots();

  const currentDurationPrice = useMemo(() => {
    const p = pricingData?.durationPricing?.find((dp) => dp.duration === slotDuration);
    return p?.price ?? null;
  }, [pricingData, slotDuration]);

  const hasPricingConfigured = currentDurationPrice !== null && currentDurationPrice > 0;

  const dayPast = date ? isPast(date) && !isSameDay(date, new Date()) : false;

  const newSlotCount = useMemo(() => {
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const mins = (eh ?? 0) * 60 + (em ?? 0) - ((sh ?? 0) * 60 + (sm ?? 0));
    return Math.max(0, Math.floor(mins / slotDuration));
  }, [startTime, endTime, slotDuration]);

  const availableCount = daySlots.filter((s) => s.status === 'AVAILABLE').length;
  const bookedCount = daySlots.filter(
    (s) => s.status === 'BOOKED' || s.status === 'RESERVED',
  ).length;

  const handleCreate = () => {
    if (!date) return;
    if (startTime >= endTime) {
      toast.error('End time must be after start time');
      return;
    }
    if (newSlotCount === 0) {
      toast.error('No slots would be created with these settings');
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
          toast.success(msg || `Created ${newSlotCount} slot${newSlotCount !== 1 ? 's' : ''}`);
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

  const title = date ? format(date, 'EEEE, MMM d') : 'Slots';
  const subtitle = hasSlots
    ? `${availableCount} available · ${bookedCount} booked`
    : 'No slots yet';

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{subtitle}</DialogDescription>
          </DialogHeader>

          {mode === 'manage' ? (
            <div className="space-y-4 pt-2">
              {hasSlots ? (
                <div className="space-y-1.5 max-h-[50vh] overflow-y-auto pr-1">
                  {daySlots.map((slot) => {
                    const isBooked = slot.status === 'BOOKED' || slot.status === 'RESERVED';
                    return (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors"
                      >
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
                        {isBooked ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewSlot?.(slot)}
                            className="shrink-0"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSlot(slot)}
                            disabled={isDeletingOne}
                            className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
                    Add more slots
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

              {hasSlots && (
                <Alert>
                  <AlertDescription className="text-xs">
                    New slots will be added alongside existing ones. Overlapping times are skipped.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Time Range</label>
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

              <div className="border rounded-lg p-3 bg-muted/30">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-lg font-semibold">{newSlotCount}</span>
                    <span className="text-muted-foreground ml-1.5 text-sm">
                      slot{newSlotCount !== 1 ? 's' : ''} will be created
                    </span>
                  </div>
                  {hasPricingConfigured && newSlotCount > 0 && (
                    <span className="text-sm font-medium">
                      €{(newSlotCount * (currentDurationPrice || 0)).toFixed(0)}
                    </span>
                  )}
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleCreate}
                disabled={newSlotCount === 0 || !hasPricingConfigured || isCreating || dayPast}
              >
                {isCreating ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Creating...
                  </>
                ) : (
                  `Create ${newSlotCount} Slot${newSlotCount !== 1 ? 's' : ''}`
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
