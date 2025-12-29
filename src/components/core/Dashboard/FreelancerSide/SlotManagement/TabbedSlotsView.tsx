'use client';

import { useMemo, useState } from 'react';

import { DataTable } from '@/components/common/DataTable/data-table';
import { createSlotsColumns } from '@/components/common/DataTable/slots-columns';
import { useDeleteSlot, useMySlots } from '@/hooks/queries/useSlots';
import { type Slot } from '@/types/types';

export const TabbedSlotsView = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
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

  // Create columns with delete handler
  const columns = useMemo(() => createSlotsColumns(handleDeleteSlot), [handleDeleteSlot]);

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
      />
    </div>
  );
};
