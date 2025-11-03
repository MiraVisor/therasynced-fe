'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Calendar, Users, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import { DataTable } from '@/components/common/DataTable/data-table';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Badge } from '@/components/ui/badge';
import { EnhancedStatCard } from '@/components/ui/enhanced-stat-card';
import LoadingSpinner from '@/components/ui/loading-spinner';
import adminBookingsService, {
  AdminBookingDto,
  AdminBookingsStatsDto,
} from '@/services/adminBookingsService';

// ----------------------
// ✅ Booking Table Columns
// ----------------------
type Booking = AdminBookingDto;

const bookingColumns: ColumnDef<Booking>[] = [
  {
    accessorKey: 'patientName',
    header: 'Patient',
    cell: ({ row }) => (
      <div className="font-inter font-medium text-charcoal">{row.original.patientName}</div>
    ),
  },
  {
    accessorKey: 'therapistName',
    header: 'Therapist',
    cell: ({ row }) => (
      <div className="font-inter text-sm text-foreground">{row.original.therapistName}</div>
    ),
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => (
      <div className="font-inter text-sm text-foreground">
        {new Date(row.original.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </div>
    ),
  },
  {
    accessorKey: 'reason',
    header: 'Reason',
    cell: ({ row }) => (
      <div className="font-inter text-sm text-muted-foreground max-w-xs truncate">
        {row.original.reason || '-'}
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status;

      const statusStyles: Record<string, string> = {
        CONFIRMED: 'bg-info/10 text-info border-info/20',
        COMPLETED: 'bg-success/10 text-success border-success/20',
        CANCELLED: 'bg-error/10 text-error border-error/20',
        RESCHEDULED: 'bg-warning/10 text-warning border-warning/20',
      };

      const statusLabels: Record<string, string> = {
        CONFIRMED: 'Confirmed',
        COMPLETED: 'Completed',
        CANCELLED: 'Cancelled',
        RESCHEDULED: 'Rescheduled',
      };

      return (
        <Badge
          variant="outline"
          className={`font-inter font-medium text-xs px-2 py-1 ${
            statusStyles[status] || 'bg-muted text-muted-foreground border-muted'
          }`}
        >
          {statusLabels[status] || status}
        </Badge>
      );
    },
  },
];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBookingDto[]>([]);
  const [stats, setStats] = useState<AdminBookingsStatsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when search term changes (before debounce)
  useEffect(() => {
    if (searchTerm !== debouncedSearchTerm) {
      setPage(1);
    }
  }, [searchTerm]);

  // Fetch when debounced search term, page, or page size changes
  useEffect(() => {
    fetchBookings(page, pageSize, debouncedSearchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, page, pageSize]);

  // Fetch booking stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsData = await adminBookingsService.getStats();
        setStats(statsData);
      } catch (err) {
        console.error('Error fetching booking stats:', err);
      }
    };
    fetchStats();
  }, []);

  // Fetch bookings data
  const fetchBookings = async (currentPage: number, currentPageSize: number, search?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminBookingsService.getAll({
        page: currentPage,
        limit: currentPageSize,
        search: search || undefined,
      });
      setBookings(response.bookings);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
      console.error('Error fetching admin bookings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  // Format currency value
  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  if (isLoading && !stats && bookings.length === 0) {
    return (
      <DashboardPageWrapper
        header={<h1 className="font-poppins font-bold text-2xl text-charcoal">Appointments</h1>}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardPageWrapper>
    );
  }

  if (error && !stats && bookings.length === 0) {
    return (
      <DashboardPageWrapper
        header={<h1 className="font-poppins font-bold text-2xl text-charcoal">Appointments</h1>}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-error mb-4">Error loading bookings</p>
            <p className="text-gray-600 text-sm">{error}</p>
          </div>
        </div>
      </DashboardPageWrapper>
    );
  }

  const statsData = stats
    ? [
        {
          title: "Today's Appointments",
          value: formatNumber(stats.todaysAppointments.value),
          trend: {
            value: Math.abs(stats.todaysAppointments.percentageChange),
            isUp: stats.todaysAppointments.percentageChange >= 0,
            label: stats.todaysAppointments.comparisonPeriod,
          },
          icon: Calendar,
          iconColor: 'text-primary',
          iconBg: 'bg-primary/10',
        },
        {
          title: 'Canceled Appointments',
          value: formatNumber(stats.canceledAppointments.value),
          trend: {
            value: Math.abs(stats.canceledAppointments.percentageChange),
            isUp: stats.canceledAppointments.percentageChange >= 0,
            label: stats.canceledAppointments.comparisonPeriod,
          },
          icon: XCircle,
          iconColor: 'text-error',
          iconBg: 'bg-error/10',
        },
        {
          title: 'Therapists Online',
          value: formatNumber(stats.therapistsOnline.value),
          trend: {
            value: Math.abs(stats.therapistsOnline.percentageChange),
            isUp: stats.therapistsOnline.percentageChange >= 0,
            label: stats.therapistsOnline.comparisonPeriod,
          },
          icon: Users,
          iconColor: 'text-success',
          iconBg: 'bg-success/10',
        },
      ]
    : [];

  return (
    <DashboardPageWrapper
      header={<h1 className="font-poppins font-bold text-2xl text-charcoal">Appointments</h1>}
    >
      <div className="space-y-6 lg:space-y-8">
        {/* 🔹 Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statsData.length > 0
            ? statsData.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <EnhancedStatCard
                    key={index}
                    title={stat.title}
                    value={stat.value}
                    trend={stat.trend}
                    icon={Icon}
                    iconColor={stat.iconColor}
                    iconBg={stat.iconBg}
                    interactive
                    onClick={() => {
                      // Navigate to details or show modal
                    }}
                  />
                );
              })
            : // Show placeholder stats while loading
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg p-6 border border-gray-200 animate-pulse"
                >
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
        </div>

        {/* 📋 Appointments Table */}
        <DataTable
          columns={bookingColumns}
          data={bookings}
          title="Appointment Bookings"
          searchKey="patientName"
          searchPlaceholder="Search by patient name"
          enablePagination={true}
          pageSize={pageSize}
          loading={isLoading}
          externalSearchValue={searchTerm}
          onExternalSearchChange={handleSearchChange}
          externalPageIndex={page - 1}
          externalPageSize={pageSize}
          totalPages={totalPages}
          onExternalPageChange={(pageIndex) => handlePageChange(pageIndex + 1)}
          onExternalPageSizeChange={handlePageSizeChange}
        />
      </div>
    </DashboardPageWrapper>
  );
}
