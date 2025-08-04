'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Calendar, Clock, MapPin, User } from 'lucide-react';
import { useState } from 'react';

import { DataTable } from '@/components/common/DataTable/data-table';
import { StatsCard } from '@/components/core/Dashboard/AdminSide/Cards/StatsCard';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePatientBookings } from '@/hooks/useBookings';
import { Booking } from '@/types/types';

// Column definitions for bookings table
const bookingColumns: ColumnDef<Booking>[] = [
  {
    accessorKey: 'id',
    header: 'Booking ID',
    cell: ({ row }) => <div className="text-gray-600 font-mono">{row.getValue('id')}</div>,
  },
  {
    accessorKey: 'client.name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:bg-transparent p-0"
        >
          <User className="mr-2 h-4 w-4" />
          Client
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
          {row.original.client.name.charAt(0)}
        </div>
        <div>
          <div className="font-medium">{row.original.client.name}</div>
          <div className="text-sm text-gray-500">{row.original.client.email}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'slot.freelancer.name',
    header: 'Therapist',
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.slot.freelancer.name}</div>
        <div className="text-sm text-gray-500">{row.original.slot.freelancer.email}</div>
      </div>
    ),
  },
  {
    accessorKey: 'slot.startTime',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:bg-transparent p-0"
        >
          <Calendar className="mr-2 h-4 w-4" />
          Date & Time
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const startTime = new Date(row.original.slot.startTime);
      const endTime = new Date(row.original.slot.endTime);

      return (
        <div>
          <div className="font-medium">{startTime.toLocaleDateString()}</div>
          <div className="text-sm text-gray-500 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
            {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'slot.locationType',
    header: 'Location',
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <MapPin className="h-4 w-4 text-gray-500" />
        <span className="capitalize">{row.original.slot.locationType.toLowerCase()}</span>
      </div>
    ),
  },
  {
    accessorKey: 'totalAmount',
    header: 'Amount',
    cell: ({ row }) => <div className="font-medium">${row.original.totalAmount.toFixed(2)}</div>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;

      const getStatusConfig = (status: string) => {
        switch (status) {
          case 'CONFIRMED':
            return { bg: 'bg-green-100', text: 'text-green-800', label: 'Confirmed' };
          case 'CANCELLED':
            return { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' };
          case 'RESCHEDULED':
            return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Rescheduled' };
          default:
            return { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
        }
      };

      const config = getStatusConfig(status);

      return (
        <Badge variant="outline" className={`px-3 py-1 rounded-md ${config.bg} ${config.text}`}>
          {config.label}
        </Badge>
      );
    },
  },
];

const RealBookingsPage = () => {
  const [activeTab, setActiveTab] = useState('future');
  const [includePast, setIncludePast] = useState(false);

  // Fetch future bookings by default
  const {
    bookings: futureBookings,
    loading: futureLoading,
    error: futureError,
    meta: futureMeta,
  } = usePatientBookings({ includePast: false });

  // Fetch all bookings (including past) when needed
  const {
    bookings: allBookings,
    loading: allLoading,
    error: allError,
    meta: allMeta,
  } = usePatientBookings({ includePast: true });

  const currentBookings = activeTab === 'future' ? futureBookings : allBookings;
  const currentLoading = activeTab === 'future' ? futureLoading : allLoading;
  const currentError = activeTab === 'future' ? futureError : allError;
  const currentMeta = activeTab === 'future' ? futureMeta : allMeta;

  // Calculate stats
  const stats = [
    {
      title: "Today's Bookings",
      value: currentBookings
        .filter((booking) => {
          const today = new Date();
          const bookingDate = new Date(booking.slot.startTime);
          return bookingDate.toDateString() === today.toDateString();
        })
        .length.toString(),
      trend: { value: 5.2, isUp: true, timeframe: 'yesterday' },
      icon: <Calendar className="h-6 w-6" />,
      bgColor: '#e8ebfd',
    },
    {
      title: 'Confirmed Bookings',
      value: currentBookings.filter((booking) => booking.status === 'CONFIRMED').length.toString(),
      trend: { value: 2.1, isUp: true, timeframe: 'last week' },
      icon: <User className="h-6 w-6" />,
      bgColor: '#e7fdf1',
    },
    {
      title: 'Total Revenue',
      value: `$${currentBookings
        .filter((booking) => booking.status === 'CONFIRMED')
        .reduce((sum, booking) => sum + booking.totalAmount, 0)
        .toFixed(2)}`,
      trend: { value: 8.3, isUp: true, timeframe: 'last month' },
      icon: <Clock className="h-6 w-6" />,
      bgColor: '#fde8e7',
    },
  ];

  if (currentLoading) {
    return (
      <DashboardPageWrapper header={<h2 className="text-xl font-semibold">Bookings</h2>}>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading bookings...</div>
        </div>
      </DashboardPageWrapper>
    );
  }

  if (currentError) {
    return (
      <DashboardPageWrapper header={<h2 className="text-xl font-semibold">Bookings</h2>}>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600">Error: {currentError}</div>
        </div>
      </DashboardPageWrapper>
    );
  }

  return (
    <DashboardPageWrapper header={<h2 className="text-xl font-semibold">Bookings</h2>}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            bgColor={stat.bgColor}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Tabs for Future vs All Bookings */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="future">Future Bookings</TabsTrigger>
          <TabsTrigger value="all">All Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value="future" className="mt-6">
          <DataTable
            columns={bookingColumns}
            data={currentBookings}
            title="Future Bookings"
            searchKey="client.name"
            searchPlaceholder="Search by client name..."
            enableSorting={true}
            enableFiltering={true}
            enableColumnVisibility={true}
            enablePagination={true}
            pageSize={10}
            pageSizeOptions={[5, 10, 20, 50]}
          />
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <DataTable
            columns={bookingColumns}
            data={currentBookings}
            title="All Bookings (Including Past)"
            searchKey="client.name"
            searchPlaceholder="Search by client name..."
            enableSorting={true}
            enableFiltering={true}
            enableColumnVisibility={true}
            enablePagination={true}
            pageSize={10}
            pageSizeOptions={[5, 10, 20, 50]}
          />
        </TabsContent>
      </Tabs>

      {/* Meta Information */}
      {currentMeta && (
        <div className="mt-4 text-sm text-gray-500">
          Showing {currentBookings.length} bookings
          {currentMeta.includePast !== undefined && (
            <span>
              {' '}
              • {currentMeta.includePast ? 'Including past bookings' : 'Future bookings only'}
            </span>
          )}
        </div>
      )}
    </DashboardPageWrapper>
  );
};

export default RealBookingsPage;
