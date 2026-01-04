'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import * as bookingService from '@/services/bookingService';
import { DataTable } from '@/components/common/DataTable/data-table';
import { createSlotsColumns } from '@/components/common/DataTable/slots-columns';
import { InvoiceGenerationDialog } from '@/components/core/Dashboard/FreelancerSide/Appointment/InvoiceGenerationDialog';
import { SlotDetailsDialog } from '@/components/core/Dashboard/FreelancerSide/SlotManagement/SlotDetailsDialog';
import { Button } from '@/components/ui/button';
import { useDeleteSlot, useMySlots } from '@/hooks/queries/useSlots';
import { Appointment, type Slot } from '@/types/types';

export const TabbedSlotsView = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Slot[]>([]);
  const [invoiceSlot, setInvoiceSlot] = useState<Slot | null>(null);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [tableKey, setTableKey] = useState(0); // Key to reset table selection
  const { mutate: deleteSlot } = useDeleteSlot();

  // Helper to clear selection and reset table
  const clearSelection = () => {
    setSelectedRows([]);
    setTableKey((prev) => prev + 1); // Force table remount to clear internal selection state
  };

  // Fetch all slots
  const { data: allSlots = [], isLoading } = useMySlots({
    page: 1,
    limit: 1000, // Fetch all for filtering
    sortBy: 'startTime',
    sortOrder: 'asc',
  });

  // Filter slots by status
  const filteredSlots = useMemo(() => {
    if (statusFilter === 'all') return allSlots;

    // Special handling for COMPLETED filter - check booking status
    if (statusFilter === 'COMPLETED') {
      return allSlots.filter(
        (slot) =>
          slot.status === 'BOOKED' &&
          slot.booking &&
          (slot.booking.status === 'COMPLETED' || slot.booking.status === 'completed'),
      );
    }

    // Special handling for BOOKED filter - exclude completed bookings
    if (statusFilter === 'BOOKED') {
      return allSlots.filter(
        (slot) =>
          slot.status === 'BOOKED' &&
          slot.booking &&
          slot.booking.status !== 'COMPLETED' &&
          slot.booking.status !== 'completed',
      );
    }

    // For other statuses, filter by slot status
    return allSlots.filter((slot) => slot.status === statusFilter);
  }, [allSlots, statusFilter]);

  const handleDeleteSlot = useMemo(
    () => (slot: Slot) => {
      const slotDate = new Date(slot.startTime).toLocaleDateString();
      if (confirm(`Are you sure you want to delete this slot on ${slotDate}?`)) {
        deleteSlot(slot.id);
      }
    },
    [deleteSlot],
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
          toast.success(
            'Appointment marked as completed! ✅ The client will receive a stamp for this booking.',
          );

          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['bookings'] });
          queryClient.invalidateQueries({ queryKey: ['slots'] });
          queryClient.invalidateQueries({ queryKey: ['stamps'] });
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

  // Convert Slot to Appointment format for invoice dialog
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

  // Bulk complete handler for booked slots
  const handleBulkComplete = async () => {
    if (selectedRows.length === 0) {
      toast.warning('Please select at least one booked appointment to complete');
      return;
    }

    const bookedSlots = selectedRows.filter(
      (slot) =>
        slot.status === 'BOOKED' &&
        slot.booking &&
        slot.booking.status !== 'COMPLETED' &&
        slot.booking.status !== 'completed',
    );

    if (bookedSlots.length === 0) {
      toast.warning('Please select at least one booked appointment that is not already completed');
      return;
    }

    const bookingIds = bookedSlots
      .map((slot) => slot.booking?.id)
      .filter((id): id is string => !!id);

    if (bookingIds.length === 0) {
      toast.error('No valid booking IDs found');
      return;
    }

    if (
      !confirm(
        `Are you sure you want to mark ${bookingIds.length} appointment${bookingIds.length !== 1 ? 's' : ''} as completed?`,
      )
    ) {
      return;
    }

    try {
      const response = await bookingService.completeBookingBulk({
        bookingIds,
      });

      if (response?.success) {
        toast.success(
          `Successfully marked ${bookingIds.length} appointment${bookingIds.length !== 1 ? 's' : ''} as completed! ✅`,
        );

        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['bookings'] });
        queryClient.invalidateQueries({ queryKey: ['slots'] });
        queryClient.invalidateQueries({ queryKey: ['stamps'] });
        queryClient.invalidateQueries({ queryKey: ['favorites'] });

        // Clear selection after successful completion
        clearSelection();
      } else {
        const errorMessage = response?.message || 'Failed to complete bookings';
        toast.error(errorMessage);
        // Clear selection even on error to reset UI state
        clearSelection();
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as any)?.response?.data?.message ||
        (error instanceof Error ? error.message : 'Failed to complete bookings');
      toast.error(errorMessage);
      // Clear selection even on error to reset UI state
      clearSelection();
    }
  };

  // Bulk delete handler for available slots
  const handleBulkDelete = () => {
    if (selectedRows.length === 0) {
      toast.warning('Please select at least one slot to delete');
      return;
    }

    const availableSlots = selectedRows.filter((slot) => slot.status === 'AVAILABLE');
    if (availableSlots.length === 0) {
      toast.warning('Only available slots can be deleted');
      return;
    }

    if (
      confirm(
        `Are you sure you want to delete ${availableSlots.length} slot${availableSlots.length !== 1 ? 's' : ''}?`,
      )
    ) {
      availableSlots.forEach((slot) => {
        deleteSlot(slot.id);
      });
      clearSelection();
      toast.success(
        `Deleted ${availableSlots.length} slot${availableSlots.length !== 1 ? 's' : ''}`,
      );
    }
  };

  // Determine which bulk actions to show based on selected rows
  const bulkActions = useMemo(() => {
    const bookedSlots = selectedRows.filter(
      (slot) =>
        slot.status === 'BOOKED' &&
        slot.booking &&
        slot.booking.status !== 'COMPLETED' &&
        slot.booking.status !== 'completed',
    );
    const availableSlots = selectedRows.filter((slot) => slot.status === 'AVAILABLE');

    return {
      hasBookedSlots: bookedSlots.length > 0,
      bookedCount: bookedSlots.length,
      hasAvailableSlots: availableSlots.length > 0,
      availableCount: availableSlots.length,
    };
  }, [selectedRows]);

  // Create columns with delete, view, complete, and invoice handlers
  const columns = useMemo(
    () => createSlotsColumns(handleDeleteSlot, handleViewSlot, true),
    [handleDeleteSlot, handleViewSlot, handleCompleteBooking, handleGenerateInvoice],
  );

  // Status filter options
  const statusFilterOptions = [
    { label: 'All', value: 'all' },
    { label: 'Available', value: 'AVAILABLE' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Booked', value: 'BOOKED' },
    { label: 'Reserved', value: 'RESERVED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  return (
    <div className="space-y-4 pb-0">
      {/* Bulk Actions Bar */}
      {selectedRows.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm font-inter font-medium text-charcoal">
              {selectedRows.length} slot{selectedRows.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Show "Mark All as Completed" for booked slots */}
            {bulkActions.hasBookedSlots && (
              <Button
                variant="default"
                size="sm"
                onClick={handleBulkComplete}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Mark All as Completed ({bulkActions.bookedCount})
              </Button>
            )}

            {/* Show "Delete Selected" for available slots */}
            {bulkActions.hasAvailableSlots && (
              <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                Delete Selected ({bulkActions.availableCount})
              </Button>
            )}

            <Button variant="outline" size="sm" onClick={clearSelection}>
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      <DataTable
        key={tableKey}
        columns={columns}
        data={filteredSlots}
        title="All Slots"
        enableSorting={false}
        enableFiltering={true}
        enablePagination={true}
        pageSize={10}
        showSearch={false}
        showSorting={false}
        loading={isLoading}
        filterOptions={statusFilterOptions}
        selectedFilter={statusFilter}
        onFilterChange={setStatusFilter}
        enableRowSelection={true}
        onRowSelectionChange={setSelectedRows}
      />
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

      {/* Invoice Generation Dialog */}
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
