'use client';

import { format } from 'date-fns';
import { useMemo, useState } from 'react';

import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useMySlots } from '@/hooks/queries';
import { useBlockedDates } from '@/hooks/queries/useAvailability';
import { useMySubscription } from '@/hooks/queries/useSubscription';
import type { Slot } from '@/types/types';
import { getDayNameFromDate } from '@/utils/dateUtils';
import { formatDateForAPI } from '@/utils/slotUtils';
import { getMaxDaysForTier, getTierFromSubscription } from '@/utils/tierUtils';

/**
 * Preview component showing how slots appear to clients
 * Applies tier filtering and blocked dates filtering
 */
export const BookingPagePreview = () => {
  const { data: currentSubscription } = useMySubscription();
  const { data: blockedDates = [] } = useBlockedDates();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const tier = getTierFromSubscription(currentSubscription || null);
  const maxDays = getMaxDaysForTier(tier);

  // Fetch freelancer's slots
  const { data: allSlots = [], isLoading } = useMySlots({
    page: 1,
    limit: 1000,
    sortBy: 'startTime',
    sortOrder: 'asc',
  });

  // Get blocked dates set
  const blockedDatesSet = new Set(blockedDates.map((bd) => formatDateForAPI(new Date(bd.date))));

  // Filter slots as clients would see them
  const filteredSlots = useMemo(() => {
    if (!allSlots.length) return [];

    // Get unique days from slots
    const dayNames = new Set<string>();
    allSlots.forEach((slot: Slot) => {
      const dayName = getDayNameFromDate(new Date(slot.startTime));
      dayNames.add(dayName);
    });

    const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const configuredDays = Array.from(dayNames).sort(
      (a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b),
    );

    // Apply tier filtering
    let allowedDays: string[];
    if (configuredDays.length <= maxDays) {
      // Respect freelancer's choice if within tier limit
      allowedDays = configuredDays;
    } else {
      // Fallback: show only first N days
      allowedDays = dayOrder.slice(0, maxDays);
    }

    // Filter slots by allowed days and blocked dates
    return allSlots.filter((slot: Slot) => {
      const slotDate = new Date(slot.startTime);
      const dayName = getDayNameFromDate(slotDate);
      const dateString = formatDateForAPI(slotDate);

      // Exclude blocked dates
      if (blockedDatesSet.has(dateString)) {
        return false;
      }

      // Only show slots for allowed days
      return allowedDays.includes(dayName);
    });
  }, [allSlots, maxDays, blockedDatesSet]);

  // Group slots by date
  const slotsByDate = useMemo(() => {
    const grouped: Record<string, Slot[]> = {};
    filteredSlots.forEach((slot: Slot) => {
      const dateString = formatDateForAPI(new Date(slot.startTime));
      if (!grouped[dateString]) {
        grouped[dateString] = [];
      }
      grouped[dateString].push(slot);
    });
    return grouped;
  }, [filteredSlots]);

  // Get dates with slots
  const datesWithSlots = useMemo(() => {
    return new Set(Object.keys(slotsByDate));
  }, [slotsByDate]);

  // Get slots for selected date
  const selectedDateSlots = useMemo(() => {
    if (!selectedDate) return [];
    const dateString = formatDateForAPI(selectedDate);
    return slotsByDate[dateString] || [];
  }, [selectedDate, slotsByDate]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Booking Page Preview</CardTitle>
          <CardDescription>Preview how your slots appear to clients</CardDescription>
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
        <CardTitle>Booking Page Preview</CardTitle>
        <CardDescription>
          This is how clients see your available slots. Tier restrictions and blocked dates are
          applied.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Calendar */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-charcoal">Select Date</h3>
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={{
                hasSlots: Array.from(datesWithSlots).map((d) => {
                  const [yearStr, monthStr, dayStr] = d.split('-');
                  const year = Number(yearStr) || 0;
                  const month = Number(monthStr) || 0;
                  const day = Number(dayStr) || 0;
                  // JavaScript Date months are 0-indexed (0-11), but parsed month is 1-indexed (1-12)
                  return new Date(year, month - 1, day);
                }),
              }}
              modifiersClassNames={{
                hasSlots: 'bg-primary/10 text-primary font-semibold',
              }}
              captionLayout="dropdown"
              className="rounded-lg"
            />
          </div>
        </div>

        {/* Time Slots */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-charcoal">Available Times</h3>
          {selectedDate ? (
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              {selectedDateSlots.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto">
                  {selectedDateSlots
                    .filter((slot) => slot.status === 'AVAILABLE')
                    .map((slot) => {
                      const time = format(new Date(slot.startTime), 'h:mm a');
                      return (
                        <button
                          key={slot.id}
                          className="p-3 rounded-lg border-2 border-gray-200 bg-white text-gray-900 hover:border-primary hover:bg-primary/5 font-medium text-sm transition-all"
                        >
                          {time}
                        </button>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No available times for this date
                </div>
              )}
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-8 bg-white text-center text-gray-500 text-sm">
              Select a date to see available times
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 bg-muted/50 rounded-lg space-y-2">
          <p className="text-xs font-semibold text-charcoal">Preview Info:</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Total slots: {allSlots.length}</li>
            <li>• Visible to clients: {filteredSlots.length}</li>
            <li>• Blocked dates: {blockedDates.length}</li>
            <li>• Tier limit: {maxDays} days</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
