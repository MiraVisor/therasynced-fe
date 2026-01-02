'use client';

import { format, startOfDay } from 'date-fns';
import { X } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useBlockDates, useBlockedDates, useUnblockDates } from '@/hooks/queries/useAvailability';
import { useMySlots } from '@/hooks/queries/useSlots';
import type { Slot } from '@/types/types';
import { formatDateForAPI } from '@/utils/slotUtils';

export const BlockedDatesSection = () => {
  const { data: blockedDates = [], isLoading: isLoadingBlocked } = useBlockedDates();
  const { mutate: blockDates, isPending: isBlocking } = useBlockDates();
  const { mutate: unblockDates, isPending: isUnblocking } = useUnblockDates();

  // Fetch all slots to show on calendar
  const { data: allSlots = [], isLoading: isLoadingSlots } = useMySlots({
    page: 1,
    limit: 1000,
    sortBy: 'startTime',
    sortOrder: 'asc',
  });

  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [reason, setReason] = useState('');

  const isLoading = isLoadingBlocked || isLoadingSlots;

  // Group slots by date
  const slotsByDate = useMemo(() => {
    const grouped: Record<string, Slot[]> = {};
    allSlots.forEach((slot: Slot) => {
      const dateString = formatDateForAPI(new Date(slot.startTime));
      if (!grouped[dateString]) {
        grouped[dateString] = [];
      }
      grouped[dateString].push(slot);
    });
    return grouped;
  }, [allSlots]);

  // Get dates with slots
  const datesWithSlots = useMemo(() => {
    return new Set(Object.keys(slotsByDate));
  }, [slotsByDate]);

  // Get blocked dates as Date objects
  const blockedDatesAsDates = useMemo(() => {
    return blockedDates.map((bd) => new Date(bd.date));
  }, [blockedDates]);

  // Get blocked dates set for quick lookup
  const blockedDatesSet = useMemo(() => {
    return new Set(blockedDates.map((bd) => formatDateForAPI(new Date(bd.date))));
  }, [blockedDates]);

  const handleBlockDates = () => {
    if (selectedDates.length === 0) {
      return;
    }

    // Filter out dates that are already blocked
    const datesToBlock = selectedDates.filter((date) => {
      const dateString = formatDateForAPI(date);
      return !blockedDatesSet.has(dateString);
    });

    if (datesToBlock.length === 0) {
      return;
    }

    const dateStrings = datesToBlock.map((date) => formatDateForAPI(date));
    blockDates(
      {
        dates: dateStrings,
        reason: reason || undefined,
      },
      {
        onSuccess: () => {
          setSelectedDates([]);
          setReason('');
        },
      },
    );
  };

  const handleUnblockDate = (dateString: string) => {
    unblockDates({ dates: [dateString] });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Blocked Dates</CardTitle>
          <CardDescription>Manage dates when slots are hidden from clients</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="medium" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Blocked Dates</CardTitle>
        <CardDescription>
          Block specific dates to hide slots from clients. Slots remain in your system but won't be
          visible to clients.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Block New Dates */}
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-semibold text-charcoal">Select Dates to Block</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Select one or more dates to block. Clients won't see slots on these dates.
            </p>
          </div>

          {/* Calendar with slot indicators - same as BookingPagePreview */}
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <Calendar
              mode="multiple"
              selected={selectedDates}
              onSelect={(dates) => setSelectedDates(dates || [])}
              disabled={(date) => {
                const today = startOfDay(new Date());
                const dateToCheck = startOfDay(date);
                const dateString = formatDateForAPI(dateToCheck);
                // Disable past dates and already-blocked dates
                return dateToCheck < today || blockedDatesSet.has(dateString);
              }}
              modifiers={{
                hasSlots: Array.from(datesWithSlots).map((d) => {
                  const [yearStr, monthStr, dayStr] = d.split('-');
                  const year = Number(yearStr) || 0;
                  const month = Number(monthStr) || 0;
                  const day = Number(dayStr) || 0;
                  // JavaScript Date months are 0-indexed (0-11), but parsed month is 1-indexed (1-12)
                  return new Date(year, month - 1, day);
                }),
                blocked: blockedDatesAsDates,
              }}
              modifiersClassNames={{
                hasSlots: 'bg-primary/10 text-primary font-semibold',
                blocked: 'bg-red-100 text-red-800 line-through border-red-300',
              }}
              captionLayout="dropdown"
              className="rounded-lg"
            />
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-primary border border-primary/20 rounded" />
              <span>Has slots</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border border-red-300 rounded line-through" />
              <span>Blocked</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-semibold text-charcoal">
              Reason (Optional)
            </Label>
            <Input
              id="reason"
              placeholder="e.g., Vacation, Holiday"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="h-9"
            />
          </div>

          <Button
            onClick={handleBlockDates}
            disabled={selectedDates.length === 0 || isBlocking}
            className="w-full"
          >
            {isBlocking ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Blocking...
              </>
            ) : (
              'Block Selected Dates'
            )}
          </Button>
        </div>

        {/* Blocked Dates List */}
        {blockedDates.length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <Label className="text-sm font-semibold text-charcoal">Currently Blocked Dates</Label>
            <div className="space-y-2">
              {blockedDates.map((blockedDate) => {
                const date = new Date(blockedDate.date);
                return (
                  <div
                    key={blockedDate.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-charcoal">
                        {format(date, 'EEEE, MMMM d, yyyy')}
                      </p>
                      {blockedDate.reason && (
                        <p className="text-xs text-muted-foreground mt-1">{blockedDate.reason}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleUnblockDate(blockedDate.date)}
                      disabled={isUnblocking}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {blockedDates.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm border-t">
            <p>No blocked dates. Select dates above to block them from client view.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
