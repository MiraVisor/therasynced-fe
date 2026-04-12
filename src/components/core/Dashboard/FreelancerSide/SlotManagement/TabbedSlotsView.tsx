'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import * as bookingService from '@/services/bookingService';
import { DataTable } from '@/components/common/DataTable/data-table';
import { createSlotsColumns } from '@/components/common/DataTable/slots-columns';
import { InvoiceGenerationDialog } from '@/components/core/Dashboard/FreelancerSide/Appointment/InvoiceGenerationDialog';
import { SlotDetailsDialog } from '@/components/core/Dashboard/FreelancerSide/SlotManagement/SlotDetailsDialog';
import { invalidateBookingStatsQueries } from '@/hooks/queries/useBookings';
import { useDeleteSlot, useMySlots } from '@/hooks/queries/useSlots';
import { Appointment, type Slot } from '@/types/types';

export const TabbedSlotsView = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [invoiceSlot, setInvoiceSlot] = useState<Slot | null>(null);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const { mutate: deleteSlot } = useDeleteSlot();

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
          toast.success('Appointment marked as completed! ✅');

          // Refresh every cache that depends on booking state so revenue,
          // appointment counts, and admin surfaces update immediately.
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

  // Create columns with delete, view, complete, and invoice handlers
  const columns = useMemo(
    () => createSlotsColumns(handleDeleteSlot, handleViewSlot, false),
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
      <DataTable
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
        enableRowSelection={false}
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
