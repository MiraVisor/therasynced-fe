'use client';

import { format, startOfDay } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useBlockDates, useBlockedDates, useUnblockDates } from '@/hooks/queries/useAvailability';
import { cn } from '@/lib/utils';
import { formatDateForAPI } from '@/utils/slotUtils';

export const BlockedDatesSection = () => {
  const { data: blockedDates = [], isLoading } = useBlockedDates();
  const { mutate: blockDates, isPending: isBlocking } = useBlockDates();
  const { mutate: unblockDates, isPending: isUnblocking } = useUnblockDates();

  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [reason, setReason] = useState('');

  const handleBlockDates = () => {
    if (selectedDates.length === 0) {
      return;
    }

    const dateStrings = selectedDates.map((date) => formatDateForAPI(date));
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

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  selectedDates.length === 0 && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDates.length === 0
                  ? 'Select dates'
                  : `${selectedDates.length} date${selectedDates.length !== 1 ? 's' : ''} selected`}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="multiple"
                selected={selectedDates}
                onSelect={(dates) => setSelectedDates(dates || [])}
                disabled={(date) => {
                  const today = startOfDay(new Date());
                  return date < today;
                }}
                modifiers={{
                  blocked: blockedDates.map((bd) => new Date(bd.date)),
                }}
                modifiersClassNames={{
                  blocked: 'bg-red-100 text-red-800 line-through',
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>

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
