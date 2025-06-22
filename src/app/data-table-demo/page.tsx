'use client';

import { bookingColumns, sampleBookings } from '@/components/common/DataTable/columns';
import { DataTable } from '@/components/common/DataTable/data-table';

export default function DataTableDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Table Demo</h1>
          <p className="text-gray-600">
            A powerful, reusable data table with sorting, filtering, and pagination.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
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
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Features Demonstrated:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Sortable columns (Name, Date, Price)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Global search functionality</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Status badges with colors</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Action dropdown menus</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Pagination with page numbers</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Column visibility controls</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
