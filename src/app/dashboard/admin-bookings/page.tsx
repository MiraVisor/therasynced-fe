'use client';

import { ColumnDef } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { DataTable } from '@/components/common/DataTable/data-table';
import { StatusBadge } from '@/components/core/Dashboard/AdminSide/Components/StatusBadge';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { EnhancedStatCard } from '@/components/ui/enhanced-stat-card';
import { useAdminBookings, useAdminBookingsStats } from '@/hooks/queries/useAdmin';
import { AdminBookingDto } from '@/services/adminBookingsService';

interface BookingStats {
  todaysAppointments: number;
  canceledAppointments: number;
  therapistsOnline: number;
  totalBookingsThisMonth: number;
  completedBookingsThisMonth: number;
  pendingBookings: number;
  totalBookingsAllTime: number;
}

const statsConfig = [
  {
    key: 'totalBookingsAllTime' as keyof BookingStats,
    title: 'Total All Time',
  },
  {
    key: 'todaysAppointments' as keyof BookingStats,
    title: "Today's Appointments",
  },
  {
    key: 'canceledAppointments' as keyof BookingStats,
    title: 'Canceled Appointments',
  },
  {
    key: 'therapistsOnline' as keyof BookingStats,
    title: 'Therapists Online',
  },
  {
    key: 'totalBookingsThisMonth' as keyof BookingStats,
    title: 'Total This Month',
  },
  {
    key: 'completedBookingsThisMonth' as keyof BookingStats,
    title: 'Completed This Month',
  },
  {
    key: 'pendingBookings' as keyof BookingStats,
    title: 'Pending Bookings',
  },
];

const AdminBookingsPage = () => {
  // State for pagination and search
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      // Reset to page 1 when search changes
      if (searchQuery !== debouncedSearch) {
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, debouncedSearch]);

  // Fetch bookings with pagination, search, and status filter
  const {
    data: bookingsData,
    isLoading,
    isFetching,
    error,
  } = useAdminBookings({
    page,
    limit: pageSize,
    name: debouncedSearch || undefined,
  });

  const bookings = bookingsData?.bookings || [];
  const pagination = bookingsData?.pagination;

  // Fetch stats
  const {
    data: statsData,
    isLoading: statsLoading,
    isFetching: _statsFetching,
    error: statsError,
  } = useAdminBookingsStats();

  const stats: BookingStats = statsData || {
    totalBookingsAllTime: 0,
    todaysAppointments: 0,
    canceledAppointments: 0,
    therapistsOnline: 0,
    totalBookingsThisMonth: 0,
    completedBookingsThisMonth: 0,
    pendingBookings: 0,
  };

  // Show errors as toast when they occur
  useEffect(() => {
    if (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load bookings';
      toast.error(errorMessage);
    }
  }, [error]);

  useEffect(() => {
    if (statsError) {
      const errorMessage =
        statsError instanceof Error ? statsError.message : 'Failed to load booking stats';
      toast.error(errorMessage);
    }
  }, [statsError]);

  // Format currency
  const formatCurrency = (value: number): string => {
    return `EUR ${value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const columns: ColumnDef<AdminBookingDto>[] = [
    {
      accessorKey: 'id',
      header: 'Booking ID',
      cell: ({ row }) => (
        <div className="font-inter text-sm text-charcoal font-mono select-all">
          {row.original.id}
        </div>
      ),
    },
    {
      accessorKey: 'therapistName',
      header: 'Therapist',
      cell: ({ row }) => (
        <div>
          <div className="font-inter font-medium text-charcoal">{row.original.therapistName}</div>
        </div>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Date & Time',
      cell: ({ row }) => {
        const startDate = new Date(row.original.startTime);
        const endDate = new Date(row.original.endTime);
        return (
          <div className="font-inter text-sm text-charcoal">
            <div>
              {startDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
            <div className="text-gray-500 text-xs">
              {startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} -{' '}
              {endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => (
        <div className="font-inter text-sm font-medium text-charcoal">
          {formatCurrency(row.original.price)}
        </div>
      ),
    },
    {
      accessorKey: 'duration',
      header: 'Duration',
      cell: ({ row }) => (
        <div className="font-inter text-sm text-charcoal">{row.original.duration} min</div>
      ),
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) => {
        if (row.original.locationType === 'HOME') {
          return (
            <div className="font-inter text-sm text-charcoal">
              <div className="font-medium">Home</div>
            </div>
          );
        }
        if (row.original.location) {
          return (
            <div className="font-inter text-sm text-charcoal">
              <div className="font-medium">{row.original.location.name}</div>
              <div
                className="text-gray-500 text-xs truncate max-w-xs"
                title={row.original.location.address}
              >
                {row.original.location.address}
              </div>
            </div>
          );
        }
        return (
          <div className="font-inter text-sm text-charcoal capitalize">
            {row.original.locationType || 'N/A'}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} size="sm" />,
    },
  ];

  return (
    <DashboardPageWrapper
      header={<h1 className="font-poppins font-bold text-2xl text-charcoal">Admin Bookings</h1>}
    >
      <div className="space-y-6 lg:space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {statsConfig.map((config) => (
            <EnhancedStatCard
              key={config.key}
              title={config.title}
              value={stats[config.key].toString()}
              loading={statsLoading && !statsData}
            />
          ))}
        </div>

        {/* Bookings Table */}
        <DataTable
          columns={columns}
          data={bookings}
          title="All Bookings"
          searchKey="therapistName"
          searchPlaceholder="Search by therapist name..."
          enableSorting={false}
          enableFiltering={true}
          enableColumnVisibility={true}
          enablePagination={true}
          showSearch={true}
          showSorting={false}
          initialLoading={isLoading && !bookings.length}
          loading={isFetching}
          externalSearchValue={searchQuery}
          onExternalSearchChange={(value) => setSearchQuery(value)}
          externalPageIndex={page - 1}
          externalPageSize={pageSize}
          totalPages={pagination?.totalPages}
          onExternalPageChange={(pageIndex) => setPage(pageIndex + 1)}
          onExternalPageSizeChange={(newPageSize) => {
            setPageSize(newPageSize);
            setPage(1);
          }}
        />
      </div>
    </DashboardPageWrapper>
  );
};

export default AdminBookingsPage;
