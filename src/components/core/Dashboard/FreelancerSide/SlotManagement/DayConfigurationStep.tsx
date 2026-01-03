'use client';

import { AlertCircle, Calendar } from 'lucide-react';
import { useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMySlots } from '@/hooks/queries/useSlots';
import { cn } from '@/lib/utils';
import type { DaySlotConfiguration } from '@/types/slot';
import type { Slot } from '@/types/types';
import { getDayNameFromDate } from '@/utils/dateUtils';

const DAY_LABELS: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

interface DayConfigurationStepProps {
  selectedDays: string[];
  configurations: Record<string, DaySlotConfiguration>;
  onConfigurationChange: (day: string, config: Partial<DaySlotConfiguration>) => void;
}

export const DayConfigurationStep = ({
  selectedDays,
  configurations,
  onConfigurationChange,
}: DayConfigurationStepProps) => {
  // Fetch existing slots to show for each day
  const { data: allSlots = [] } = useMySlots({
    page: 1,
    limit: 1000,
    sortBy: 'startTime',
    sortOrder: 'asc',
  });

  // Group slots by day of week
  const slotsByDayOfWeek = useMemo(() => {
    const grouped: Record<string, Slot[]> = {};
    allSlots.forEach((slot: Slot) => {
      const slotDate = new Date(slot.startTime);
      const dayName = getDayNameFromDate(slotDate);
      if (!grouped[dayName]) {
        grouped[dayName] = [];
      }
      grouped[dayName].push(slot);
    });
    return grouped;
  }, [allSlots]);

  const validateDay = (day: string): string | null => {
    const config = configurations[day];
    if (!config) return null;

    if (config.startTime >= config.endTime) {
      return 'Start time must be before end time';
    }

    if (config.breakFrom && config.breakTill && config.breakFrom >= config.breakTill) {
      return 'Break start time must be before break end time';
    }

    // Check if break is within working hours
    if (config.breakFrom && config.breakTill) {
      if (config.breakFrom < config.startTime || config.breakTill > config.endTime) {
        return 'Break time must be within working hours';
      }
    }

    return null;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-charcoal">Configure Each Day</h3>
        <p className="text-sm text-muted-foreground">
          Set working hours, slot duration, and break times for each selected day
        </p>
      </div>

      <div className="space-y-5">
        {selectedDays.map((day) => {
          const config = configurations[day] || {
            day,
            startTime: '09:00',
            endTime: '17:00',
            slotDuration: 60,
            breakFrom: '',
            breakTill: '',
          };
          const error = validateDay(day);

          const existingSlots = slotsByDayOfWeek[day] || [];
          const futureSlots = existingSlots.filter((slot) => {
            const slotDate = new Date(slot.startTime);
            return slotDate >= new Date();
          });

          return (
            <div
              key={day}
              className={cn(
                'p-5 border-2 rounded-lg bg-white space-y-5 transition-all',
                error ? 'border-error/50 bg-error/5' : 'border-gray-200 hover:border-gray-300',
              )}
            >
              <div className="flex items-center justify-between pb-2 border-b">
                <div className="flex items-center gap-3">
                  <h4 className="text-base font-semibold text-charcoal">{DAY_LABELS[day]}</h4>
                  {futureSlots.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {futureSlots.length} existing slot{futureSlots.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
                {error && (
                  <div className="flex items-center gap-2 text-sm text-error">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {/* Existing Slots Summary */}
              {futureSlots.length > 0 && (
                <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <p className="text-sm font-semibold text-blue-900">
                        {futureSlots.length} existing slot{futureSlots.length !== 1 ? 's' : ''} for{' '}
                        {DAY_LABELS[day]}
                      </p>
                    </div>
                    {(() => {
                      const bookedCount = futureSlots.filter(
                        (slot) => slot.status === 'BOOKED',
                      ).length;
                      return bookedCount > 0 ? (
                        <span className="text-xs text-blue-700 font-medium">
                          {bookedCount} booked
                        </span>
                      ) : null;
                    })()}
                  </div>
                </div>
              )}

              {/* Working Hours */}
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-charcoal">Working Hours</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-charcoal">Start Time</Label>
                    <Input
                      type="time"
                      value={config.startTime}
                      onChange={(e) => onConfigurationChange(day, { startTime: e.target.value })}
                      className={cn('h-10', error && 'border-error')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-charcoal">End Time</Label>
                    <Input
                      type="time"
                      value={config.endTime}
                      onChange={(e) => onConfigurationChange(day, { endTime: e.target.value })}
                      className={cn('h-10', error && 'border-error')}
                    />
                  </div>
                </div>
              </div>

              {/* Slot Duration */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-charcoal">Slot Duration</Label>
                <Select
                  value={config.slotDuration.toString()}
                  onValueChange={(value) =>
                    onConfigurationChange(day, { slotDuration: parseInt(value) })
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                    <SelectItem value="120">120 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Break Time Range */}
              <div className="space-y-3 pt-3 border-t">
                <h5 className="text-sm font-medium text-charcoal">Break Time (Optional)</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-charcoal">Break From</Label>
                    <Input
                      type="time"
                      value={config.breakFrom || ''}
                      onChange={(e) => onConfigurationChange(day, { breakFrom: e.target.value })}
                      placeholder="Optional"
                      className={cn('h-10', error && 'border-error')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-charcoal">Break Till</Label>
                    <Input
                      type="time"
                      value={config.breakTill || ''}
                      onChange={(e) => onConfigurationChange(day, { breakTill: e.target.value })}
                      placeholder="Optional"
                      className={cn('h-10', error && 'border-error')}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
