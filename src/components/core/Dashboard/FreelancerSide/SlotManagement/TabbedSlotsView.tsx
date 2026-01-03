'use client';

import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { DataTable } from '@/components/common/DataTable/data-table';
import { createSlotsColumns } from '@/components/common/DataTable/slots-columns';
import { SlotDetailsDialog } from '@/components/core/Dashboard/FreelancerSide/SlotManagement/SlotDetailsDialog';
import { Button } from '@/components/ui/button';
import { useDeleteSlot, useMySlots } from '@/hooks/queries/useSlots';
import { type Slot } from '@/types/types';

export const TabbedSlotsView = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Slot[]>([]);
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

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedSlot(null);
  };

  // Bulk delete handler
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
      setSelectedRows([]);
      toast.success(
        `Deleted ${availableSlots.length} slot${availableSlots.length !== 1 ? 's' : ''}`,
      );
    }
  };

  // Create columns with delete and view handlers
  const columns = useMemo(
    () => createSlotsColumns(handleDeleteSlot, handleViewSlot, true),
    [handleDeleteSlot, handleViewSlot],
  );

  // Status filter options
  const statusFilterOptions = [
    { label: 'All', value: 'all' },
    { label: 'Available', value: 'AVAILABLE' },
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
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={selectedRows.filter((s) => s.status === 'AVAILABLE').length === 0}
            >
              Delete Selected
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSelectedRows([])}>
              Clear Selection
            </Button>
          </div>
        </div>
      )}

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
    </div>
  );
};
