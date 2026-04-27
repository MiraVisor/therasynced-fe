'use client';

import { format } from 'date-fns';
import { CalendarIcon, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useDeleteDaySlots } from '@/hooks/queries/useSlots';
import { cn } from '@/lib/utils';
import { formatDateForAPI } from '@/utils/slotUtils';

export const DeleteDaySlotsSection = () => {
  const { mutate: deleteDaySlots, isPending: isDeleting } = useDeleteDaySlots();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [deleteByDayOfWeek, setDeleteByDayOfWeek] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const handleDeleteClick = () => {
    if (selectedDate) {
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmDelete = () => {
    if (!selectedDate) return;

    const dateString = formatDateForAPI(selectedDate);
    deleteDaySlots(
      { date: dateString, deleteByDayOfWeek },
      {
        onSuccess: () => {
          setSelectedDate(undefined);
          setDeleteByDayOfWeek(false);
          setShowConfirmDialog(false);
        },
      },
    );
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Delete Slots by Day</CardTitle>
          <CardDescription>
            Delete all non-booked slots for a specific date or all future occurrences of that day of
            week. This helps clear overlapping slots or reset schedules. Booked slots cannot be
            deleted and must be cancelled first.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-charcoal">Select Date</Label>
            <p className="text-xs text-muted-foreground">
              Choose the date to delete slots. You can delete for this specific date or all future
              occurrences of this day of week.
            </p>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !selectedDate && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, 'PPP') : 'Select a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                captionLayout="dropdown">
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <div className="flex items-center space-x-2 rounded-lg border p-3 bg-muted/30">
            <Checkbox
              id="deleteByDayOfWeek"
              checked={deleteByDayOfWeek}
              onCheckedChange={(checked) => setDeleteByDayOfWeek(checked === true)}
            />
            <Label
              htmlFor="deleteByDayOfWeek"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Delete all future occurrences of this day of week
            </Label>
          </div>
          {selectedDate && deleteByDayOfWeek && (
            <p className="text-xs text-muted-foreground pl-1">
              This will delete all future {getDayName(selectedDate)}s starting from{' '}
              {format(selectedDate, 'MMMM d, yyyy')}
            </p>
          )}

          <Button
            onClick={handleDeleteClick}
            disabled={!selectedDate || isDeleting}
            variant="destructive"
            className="w-full"
          >
            {isDeleting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                {deleteByDayOfWeek
                  ? `Delete All Future ${selectedDate ? getDayName(selectedDate) : ''}s`
                  : 'Delete All Non-Booked Slots for This Day'}
              </>
            )}
          </Button>

          <div className="rounded-lg bg-muted/50 p-3 space-y-1">
            <p className="text-xs font-semibold text-charcoal">Note:</p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>Only non-booked slots will be deleted</li>
              <li>Booked slots cannot be deleted and must be cancelled first</li>
              <li>This action cannot be undone</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete Slots</DialogTitle>
            <DialogDescription>
              {deleteByDayOfWeek && selectedDate ? (
                <>
                  Are you sure you want to delete all non-booked slots for all future{' '}
                  <strong>{getDayName(selectedDate)}s</strong> starting from{' '}
                  {format(selectedDate, 'MMMM d, yyyy')}?
                </>
              ) : (
                <>
                  Are you sure you want to delete all non-booked slots for{' '}
                  {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : ''}?
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-destructive/10 p-3 border border-destructive/20 space-y-2">
            <p className="text-sm text-destructive font-medium">
              ⚠️ This action cannot be undone. Only non-booked slots will be deleted.
            </p>
            {deleteByDayOfWeek && selectedDate && (
              <p className="text-xs text-destructive/80">
                This will affect all future {getDayName(selectedDate)}s, not just the selected date.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete Slots'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
