'use client';

import { Calendar, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DateRangeFilterProps {
  onDateRangeChange: (startDate: Date | undefined, endDate: Date | undefined) => void;
  startDate?: Date;
  endDate?: Date;
}

export function DateRangeFilter({ onDateRangeChange, startDate, endDate }: DateRangeFilterProps) {
  const [localStartDate, setLocalStartDate] = useState<string>('');
  const [localEndDate, setLocalEndDate] = useState<string>('');

  // Sync local state with props
  useEffect(() => {
    setLocalStartDate(startDate ? (startDate.toISOString().split('T')[0] ?? '') : '');
    setLocalEndDate(endDate ? (endDate.toISOString().split('T')[0] ?? '') : '');
  }, [startDate, endDate]);

  const handleApply = () => {
    let start: Date | undefined;
    let end: Date | undefined;

    if (localStartDate) {
      // Create date at midnight local time
      const startDateObj = new Date(localStartDate);
      startDateObj.setHours(0, 0, 0, 0);
      start = startDateObj;
    }

    if (localEndDate) {
      // Create date at end of day local time
      const endDateObj = new Date(localEndDate);
      endDateObj.setHours(23, 59, 59, 999);
      end = endDateObj;
    }

    // Validate date range
    if (start && end && start > end) {
      return; // Don't apply if invalid
    }

    onDateRangeChange(start, end);
  };

  const handleReset = () => {
    setLocalStartDate('');
    setLocalEndDate('');
    onDateRangeChange(undefined, undefined);
  };

  const hasActiveFilter = !!(startDate ?? endDate);

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-inter font-medium text-gray-700">Date Range Filter</span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <Label htmlFor="start-date" className="text-xs text-gray-500 whitespace-nowrap">
              Start Date
            </Label>
            <Input
              id="start-date"
              type="date"
              value={localStartDate}
              onChange={(e) => setLocalStartDate(e.target.value)}
              className="w-full sm:w-auto"
              max={localEndDate || undefined}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <Label htmlFor="end-date" className="text-xs text-gray-500 whitespace-nowrap">
              End Date
            </Label>
            <Input
              id="end-date"
              type="date"
              value={localEndDate}
              onChange={(e) => setLocalEndDate(e.target.value)}
              className="w-full sm:w-auto"
              min={localStartDate || undefined}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleApply}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white"
            >
              Apply
            </Button>
            {hasActiveFilter && (
              <Button
                onClick={handleReset}
                size="sm"
                variant="outline"
                className="flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {hasActiveFilter && (
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-lg">
            <span>Active filter:</span>
            <span className="font-medium">
              {startDate?.toLocaleDateString()} - {endDate?.toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
