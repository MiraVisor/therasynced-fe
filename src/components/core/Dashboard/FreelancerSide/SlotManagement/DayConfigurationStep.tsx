'use client';

import { AlertCircle } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { DaySlotConfiguration } from '@/types/slot';

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

          return (
            <div
              key={day}
              className={cn(
                'p-5 border-2 rounded-lg bg-white space-y-5 transition-all',
                error ? 'border-error/50 bg-error/5' : 'border-gray-200 hover:border-gray-300',
              )}
            >
              <div className="flex items-center justify-between pb-2 border-b">
                <h4 className="text-base font-semibold text-charcoal">{DAY_LABELS[day]}</h4>
                {error && (
                  <div className="flex items-center gap-2 text-sm text-error">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

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
