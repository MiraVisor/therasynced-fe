'use client';

import { bookingColumns, sampleBookings } from '@/components/common/DataTable/columns';
import { DataTable } from '@/components/common/DataTable/data-table';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';

export default function MyBookingsPage() {
  return (
    <DashboardPageWrapper header={<h2 className="text-xl font-semibold">Check Your Bookings</h2>}>
      <DataTable
        columns={bookingColumns}
        data={sampleBookings}
        title="All Bookings"
        searchKey="name"
        searchPlaceholder="Search..."
        enableSorting={true}
        enableFiltering={true}
        enableColumnVisibility={true}
        enablePagination={true}
        pageSize={8}
        pageSizeOptions={[5, 10, 20, 30, 40]}
      />
    </DashboardPageWrapper>
  );
}
