'use client';

import { bookingColumns, sampleBookings } from '@/components/common/DataTable/columns';
import { DataTable } from '@/components/common/DataTable/data-table';

export default function BookingsExamplePage() {
  return (
    <div className="container mx-auto py-10">
      <DataTable
        columns={bookingColumns}
        data={sampleBookings}
        title="All Bookings"
        searchKey="name"
        searchPlaceholder="Search by name..."
        enableSorting={true}
        enableFiltering={true}
        enableColumnVisibility={true}
        enablePagination={true}
        pageSize={5}
        pageSizeOptions={[5, 10, 20, 30, 40]}
      />
    </div>
  );
}
