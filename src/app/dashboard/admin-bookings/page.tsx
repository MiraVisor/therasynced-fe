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
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
}

const statsConfig = [
  {
    key: 'total' as keyof BookingStats,
    title: 'Total Bookings',
    icon: Calendar,
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
  },
  {
    key: 'confirmed' as keyof BookingStats,
    title: 'Confirmed',
    icon: Users,
    iconColor: 'text-success',
    iconBg: 'bg-success/10',
  },
  {
    key: 'pending' as keyof BookingStats,
    title: 'Pending',
    icon: Calendar,
    iconColor: 'text-warning',
    iconBg: 'bg-warning/10',
  },
  {
    key: 'cancelled' as keyof BookingStats,
    title: 'Cancelled',
    icon: XCircle,
    iconColor: 'text-error',
    iconBg: 'bg-error/10',
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
    search: debouncedSearch || undefined,
  });

  // Calculate stats - we'll need to fetch these separately or from the API
  const [stats, setStats] = useState<BookingStats>({
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch stats separately
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const statsResponse = await adminBookingsService.getStats();

        // Map the stats to our interface
        setStats({
          total: statsResponse.totalBookingsAllTime || 0,
          confirmed: statsResponse.completedBookingsThisMonth || 0,
          pending: statsResponse.pendingBookings || 0,
          cancelled: statsResponse.canceledAppointments?.value || 0,
        });
      } catch (error) {
        // Error handled by toast in useEffect below
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Show error as toast when it occurs
  useEffect(() => {
    if (error) {
      toast.error(`Failed to load bookings: ${error}`);
    }
  }, [error]);

  if (initialLoading && statsLoading && bookings.length === 0) {
    return (
      <DashboardPageWrapper
        header={<h1 className="font-poppins font-bold text-2xl text-charcoal">Admin Bookings</h1>}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading bookings...</p>
          </div>
        </div>
      </DashboardPageWrapper>
    );
  }

  const columns: ColumnDef<AdminBookingDto>[] = [
    {
      accessorKey: 'patientName',
      header: 'Patient',
      cell: ({ row }) => (
        <div>
          <div className="font-inter font-medium text-charcoal">{row.original.patientName}</div>
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
      accessorKey: 'reason',
      header: 'Reason',
      cell: ({ row }) => (
        <div className="font-inter text-sm text-charcoal max-w-xs truncate">
          {row.original.reason || '-'}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} size="sm" />,
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => (
        <div className="font-inter text-sm text-charcoal">
          {new Date(row.original.date).toLocaleDateString()}
        </div>
      ),
    },
  ];

  return (
    <DashboardPageWrapper
      header={<h1 className="font-poppins font-bold text-2xl text-charcoal">Admin Bookings</h1>}
    >
      <div className="space-y-6 lg:space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {statsConfig.map((config) => (
            <EnhancedStatCard
              key={config.key}
              title={config.title}
              value={stats[config.key].toString()}
              icon={config.icon}
              iconColor={config.iconColor}
              iconBg={config.iconBg}
              loading={statsLoading}
            />
          ))}
        </div>

        {/* Bookings Table */}
        <DataTable
          columns={columns}
          data={bookings}
          title="All Bookings"
          searchKey="patientName"
          searchPlaceholder="Search bookings..."
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
