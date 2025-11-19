'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Calendar, Users, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { DataTable } from '@/components/common/DataTable/data-table';
import { StatusBadge } from '@/components/core/Dashboard/AdminSide/Components/StatusBadge';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { EnhancedStatCard } from '@/components/ui/enhanced-stat-card';
import { useAdminBookings } from '@/hooks/useBookings';
import adminBookingsService, { AdminBookingDto } from '@/services/adminBookingsService';

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
    icon: Calendar,
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
  },
  {
    key: 'todaysAppointments' as keyof BookingStats,
    title: "Today's Appointments",
    icon: Calendar,
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
  },
  {
    key: 'canceledAppointments' as keyof BookingStats,
    title: 'Canceled Appointments',
    icon: XCircle,
    iconColor: 'text-error',
    iconBg: 'bg-error/10',
  },
  {
    key: 'therapistsOnline' as keyof BookingStats,
    title: 'Therapists Online',
    icon: Users,
    iconColor: 'text-success',
    iconBg: 'bg-success/10',
  },
  {
    key: 'totalBookingsThisMonth' as keyof BookingStats,
    title: 'Total This Month',
    icon: Calendar,
    iconColor: 'text-info',
    iconBg: 'bg-info/10',
  },
  {
    key: 'completedBookingsThisMonth' as keyof BookingStats,
    title: 'Completed This Month',
    icon: Users,
    iconColor: 'text-success',
    iconBg: 'bg-success/10',
  },
  {
    key: 'pendingBookings' as keyof BookingStats,
    title: 'Pending Bookings',
    icon: Calendar,
    iconColor: 'text-warning',
    iconBg: 'bg-warning/10',
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
  const { bookings, loading, initialLoading, error, pagination } = useAdminBookings({
    page,
    limit: pageSize,
    name: debouncedSearch || undefined,
  });

  // Calculate stats - we'll need to fetch these separately or from the API
  const [stats, setStats] = useState<BookingStats>({
    totalBookingsAllTime: 0,
    todaysAppointments: 0,
    canceledAppointments: 0,
    therapistsOnline: 0,
    totalBookingsThisMonth: 0,
    completedBookingsThisMonth: 0,
    pendingBookings: 0,
  });
  const [statsLoading, setStatsLoading] = useState(false);
  const [initialStatsLoading, setInitialStatsLoading] = useState(true);

  // Fetch stats separately
  useEffect(() => {
    const fetchStats = async () => {
      const hasStats = stats.totalBookingsAllTime > 0 || stats.todaysAppointments > 0;
      try {
        if (!hasStats) {
          setInitialStatsLoading(true);
        } else {
          setStatsLoading(true);
        }
        const statsResponse = await adminBookingsService.getStats();

        // Map the stats to our interface - updated for simplified response
        setStats({
          totalBookingsAllTime: statsResponse.totalBookingsAllTime || 0,
          todaysAppointments: statsResponse.todaysAppointments || 0,
          canceledAppointments: statsResponse.canceledAppointments || 0,
          therapistsOnline: statsResponse.therapistsOnline || 0,
          totalBookingsThisMonth: statsResponse.totalBookingsThisMonth || 0,
          completedBookingsThisMonth: statsResponse.completedBookingsThisMonth || 0,
          pendingBookings: statsResponse.pendingBookings || 0,
        });
      } catch (error) {
        // Error handled by toast in useEffect below
      } finally {
        setStatsLoading(false);
        setInitialStatsLoading(false);
      }
    };

    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show error as toast when it occurs
  useEffect(() => {
    if (error) {
      toast.error(`Failed to load bookings: ${error}`);
    }
  }, [error]);

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
              icon={config.icon}
              iconColor={config.iconColor}
              iconBg={config.iconBg}
              loading={
                initialStatsLoading ||
                (statsLoading && stats.totalBookingsAllTime === 0 && stats.todaysAppointments === 0)
              }
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
          initialLoading={initialLoading}
          loading={loading}
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
