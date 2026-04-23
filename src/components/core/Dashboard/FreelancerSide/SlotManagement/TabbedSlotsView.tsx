'use client';

import { useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { Check, ChevronDown, ChevronUp, FileText, MoreVertical, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import * as bookingService from '@/services/bookingService';
import { InvoiceGenerationDialog } from '@/components/core/Dashboard/FreelancerSide/Appointment/InvoiceGenerationDialog';
import { SlotDetailsDialog } from '@/components/core/Dashboard/FreelancerSide/SlotManagement/SlotDetailsDialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { invalidateBookingStatsQueries } from '@/hooks/queries/useBookings';
import { useDeleteDaySlots, useDeleteSlot, useMySlots } from '@/hooks/queries/useSlots';
import { cn } from '@/lib/utils';
import { Appointment, type Slot } from '@/types/types';

export const TabbedSlotsView = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [invoiceSlot, setInvoiceSlot] = useState<Slot | null>(null);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  const { mutate: deleteSlot } = useDeleteSlot();
  const { mutate: deleteDaySlots } = useDeleteDaySlots();

  // Fetch all slots
  const { data: allSlots = [], isLoading } = useMySlots({
    page: 1,
    limit: 1000,
    sortBy: 'startTime',
    sortOrder: 'asc',
  });

  // Filter slots by status
  const filteredSlots = useMemo(() => {
    if (statusFilter === 'all') return allSlots;

    if (statusFilter === 'COMPLETED') {
      return allSlots.filter(
        (slot) =>
          slot.status === 'BOOKED' &&
          slot.booking &&
          (slot.booking.status === 'COMPLETED' || slot.booking.status === 'completed'),
      );
    }

    if (statusFilter === 'BOOKED') {
      return allSlots.filter(
        (slot) =>
          slot.status === 'BOOKED' &&
          slot.booking &&
          slot.booking.status !== 'COMPLETED' &&
          slot.booking.status !== 'completed',
      );
    }

    return allSlots.filter((slot) => slot.status === statusFilter);
  }, [allSlots, statusFilter]);

  // Auto-expand all date groups when filtering to a curated subset
  // (Booked, Completed, Reserved, Cancelled) - those are small result sets
  // where the user's immediate goal is to see/act on everything.
  useEffect(() => {
    if (statusFilter === 'all' || statusFilter === 'AVAILABLE') return;

    const keysToExpand = new Set<string>();
    filteredSlots.forEach((slot) => {
      keysToExpand.add(format(parseISO(slot.startTime), 'yyyy-MM-dd'));
    });
    setExpandedDates(keysToExpand);
  }, [statusFilter, filteredSlots]);

  // Group slots by date
  const groupedSlots = useMemo(() => {
    const grouped: Record<string, Slot[]> = {};

    filteredSlots.forEach((slot) => {
      const dateKey = format(parseISO(slot.startTime), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(slot);
    });

    // Sort dates
    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([dateKey, slots]) => ({
        dateKey,
        date: parseISO(dateKey),
        slots: slots.sort(
          (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
        ),
      }));
  }, [filteredSlots]);

  const handleDeleteSlot = useMemo(
    () => (slot: Slot) => {
      const slotDate = new Date(slot.startTime).toLocaleDateString();
      if (confirm(`Are you sure you want to delete this slot on ${slotDate}?`)) {
        deleteSlot(slot.id);
      }
    },
    [deleteSlot],
  );

  // Bulk-clear all AVAILABLE slots for a given day. Booked slots stay put
  // - those need to go through the booking cancellation flow separately.
  const handleClearDay = useMemo(
    () => (dateKey: string, availableOnDay: number) => {
      if (availableOnDay === 0) return;
      if (
        !confirm(
          `Delete ${availableOnDay} available ${availableOnDay === 1 ? 'slot' : 'slots'} on ${format(
            parseISO(dateKey),
            'EEE, MMM d',
          )}? Booked slots are not affected.`,
        )
      ) {
        return;
      }
      deleteDaySlots(
        { date: dateKey },
        {
          onSuccess: (res) => {
            toast.success(res?.message || 'Day cleared');
          },
          onError: (e: unknown) => {
            const msg = (e as { message?: string })?.message || 'Failed to clear day';
            toast.error(msg);
          },
        },
      );
    },
    [deleteDaySlots],
  );

  const handleViewSlot = useMemo(
    () => (slot: Slot) => {
      setSelectedSlot(slot);
      setIsDialogOpen(true);
    },
    [],
  );

  const handleCompleteBooking = useMemo(
    () => async (slot: Slot) => {
      if (!slot.booking?.id) {
        toast.error('Booking ID not found');
        return;
      }

      try {
        const response = await bookingService.completeBooking({
          bookingId: slot.booking.id,
        });

        if (response?.success) {
          toast.success('Appointment marked as completed! ✅');
          invalidateBookingStatsQueries(queryClient);
          queryClient.invalidateQueries({ queryKey: ['favorites'] });
        } else {
          const errorMessage = response?.message || 'Failed to complete booking';
          toast.error(errorMessage);
        }
      } catch (error: unknown) {
        const errorMessage =
          (error as any)?.response?.data?.message ||
          (error instanceof Error ? error.message : 'Failed to complete booking');
        toast.error(errorMessage);
      }
    },
    [queryClient],
  );

  const handleGenerateInvoice = useMemo(
    () => (slot: Slot) => {
      if (!slot.booking) {
        toast.error('No booking found for this slot');
        return;
      }
      setInvoiceSlot(slot);
      setShowInvoiceDialog(true);
    },
    [],
  );

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedSlot(null);
  };

  const appointmentData = useMemo((): Appointment | null => {
    if (!invoiceSlot?.booking) return null;

    return {
      id: invoiceSlot.booking.id,
      title: 'Appointment',
      start: invoiceSlot.startTime,
      end: invoiceSlot.endTime,
      status: invoiceSlot.booking.status as any,
      clientName: invoiceSlot.booking.client.name,
      clientId: invoiceSlot.booking.client.id,
      freelancer: {
        clinicAddress: null,
      },
      location: invoiceSlot.locationType || 'CLINIC',
      notes: invoiceSlot.booking.notes || '',
    };
  }, [invoiceSlot]);

  const statusFilterOptions = [
    { label: 'All', value: 'all' },
    { label: 'Available', value: 'AVAILABLE' },
    { label: 'Booked', value: 'BOOKED' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Reserved', value: 'RESERVED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  const toggleDateExpanded = (dateKey: string) => {
    setExpandedDates((prev) => {
      const next = new Set(prev);
      if (next.has(dateKey)) {
        next.delete(dateKey);
      } else {
        next.add(dateKey);
      }
      return next;
    });
  };

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading slots...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filter pills - always visible */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-inter font-medium text-gray-600">Filter:</span>
        {statusFilterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setStatusFilter(option.value)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-inter font-medium transition',
              statusFilter === option.value
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Empty state - stays inside the return so filters remain clickable */}
      {filteredSlots.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg">
          <p className="text-gray-500 font-inter text-sm">
            No {statusFilter === 'all' ? '' : statusFilter.toLowerCase()} slots found
          </p>
          <p className="text-xs text-gray-400 font-inter mt-1">
            Try switching to a different filter above
          </p>
        </div>
      ) : (
        /* Grouped slots by date */
        <div className="space-y-3">
          {groupedSlots.map(({ dateKey, date, slots }) => {
            const isExpanded = expandedDates.has(dateKey);
            const bookedCount = slots.filter(
              (s) => s.status === 'BOOKED' || s.status === 'RESERVED',
            ).length;
            const availableCount = slots.filter((s) => s.status === 'AVAILABLE').length;

            return (
              <div key={dateKey} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Date header with bulk-clear action */}
                <div className="w-full p-4 bg-gray-50 flex items-center justify-between gap-3 text-left">
                  <button
                    onClick={() => toggleDateExpanded(dateKey)}
                    className="flex-1 flex items-center gap-3 min-w-0 hover:opacity-80 transition"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-charcoal font-poppins">
                        {format(date, 'EEE, MMM d, yyyy')}
                      </h3>
                      <p className="text-xs text-gray-600 font-inter mt-1">
                        {slots.length} {slots.length === 1 ? 'slot' : 'slots'}
                        {bookedCount > 0 && ` • ${bookedCount} booked`}
                        {availableCount > 0 && ` • ${availableCount} available`}
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    )}
                  </button>

                  {/* Clear day - only visible when there are AVAILABLE slots
                      to clear. Booked slots stay regardless. */}
                  {availableCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearDay(dateKey, availableCount);
                      }}
                      className="h-8 px-2.5 gap-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-100 shrink-0"
                      title={`Delete all ${availableCount} available slots on this day`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Clear day</span>
                    </Button>
                  )}
                </div>

                {/* Slots list */}
                {isExpanded && (
                  <div className="divide-y border-t">
                    {slots.map((slot) => (
                      <SlotRow
                        key={slot.id}
                        slot={slot}
                        onView={() => handleViewSlot(slot)}
                        onDelete={() => handleDeleteSlot(slot)}
                        onComplete={() => handleCompleteBooking(slot)}
                        onInvoice={() => handleGenerateInvoice(slot)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Dialogs */}
      {selectedSlot && (
        <SlotDetailsDialog
          slot={selectedSlot}
          isOpen={isDialogOpen}
          onClose={handleCloseDialog}
          onDelete={(slotId) => {
            deleteSlot(slotId);
            handleCloseDialog();
          }}
        />
      )}

      {appointmentData && invoiceSlot && (
        <InvoiceGenerationDialog
          appointment={appointmentData}
          open={showInvoiceDialog}
          onOpenChange={setShowInvoiceDialog}
          initialPrice={invoiceSlot.booking?.totalAmount || invoiceSlot.basePrice}
        />
      )}
    </div>
  );
};

// Compact slot row component
const SlotRow = ({
  slot,
  onView,
  onDelete,
  onComplete,
  onInvoice,
}: {
  slot: Slot;
  onView: () => void;
  onDelete: () => void;
  onComplete: () => void;
  onInvoice: () => void;
}) => {
  const startTime = format(parseISO(slot.startTime), 'h:mm a');
  const endTime = format(parseISO(slot.endTime), 'h:mm a');
  const isBooked = slot.status === 'BOOKED' || slot.status === 'RESERVED';
  const isCompleted = slot.booking?.status === 'COMPLETED' || slot.booking?.status === 'completed';
  const isCancelled = slot.status === 'CANCELLED';

  const showBookedActions = isBooked && !isCompleted;

  return (
    <div className="p-3 flex items-center justify-between gap-3 hover:bg-gray-50 transition">
      {/* Slot info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Time */}
          <span className="text-sm font-inter font-medium text-charcoal whitespace-nowrap">
            {startTime} – {endTime}
          </span>

          {/* Status badge */}
          <span
            className={cn(
              'inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap',
              isCompleted
                ? 'bg-purple-100 text-purple-700'
                : isBooked
                  ? 'bg-blue-100 text-blue-700'
                  : isCancelled
                    ? 'bg-red-100 text-red-700'
                    : 'bg-green-100 text-green-700',
            )}
          >
            {isCompleted ? 'Completed' : slot.status}
          </span>

          {/* Client name if booked */}
          {isBooked && slot.booking?.client && (
            <span className="text-xs text-gray-600 truncate font-inter">
              {slot.booking.client.name}
            </span>
          )}
        </div>
      </div>

      {/* Price & location (hidden when booked actions are inline to save space) */}
      {!showBookedActions && (
        <div className="hidden sm:flex items-center gap-4 text-xs text-gray-600 font-inter">
          <span>€{slot.basePrice.toFixed(2)}</span>
          <span className="text-gray-400">•</span>
          <span>{slot.location?.name || 'Clinic'}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Inline booked-slot actions - one click instead of menu → click */}
        {showBookedActions && (
          <>
            <Button
              variant="default"
              size="sm"
              onClick={onComplete}
              className="h-8 px-2.5 gap-1.5 text-xs"
              title="Mark as completed"
            >
              <Check className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Complete</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onInvoice}
              className="h-8 px-2.5 gap-1.5 text-xs"
              title="Generate invoice"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Invoice</span>
            </Button>
          </>
        )}

        {/* Inline delete button for AVAILABLE slots - main CRUD affordance
            so users don't need to open the menu to delete a slot. Booked
            slots keep the menu-only delete since deleting them needs
            confirmation and cancels the client booking. */}
        {!showBookedActions && !isCompleted && !isCancelled && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-8 px-2.5 gap-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Delete this slot"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Delete</span>
          </Button>
        )}

        {/* Secondary actions menu (kept small for less-common actions) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={onView} className="text-xs cursor-pointer">
              View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-xs cursor-pointer text-red-600 flex items-center gap-2"
            >
              <Trash2 className="w-3 h-3" />
              Delete Slot
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
