'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import Image from 'next/image';

import { DataTable } from '@/components/common/DataTable/data-table';
import { StatsCard } from '@/components/core/Dashboard/AdminSide/Cards/StatsCard';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Define booking type
export type Booking = {
  id: string;
  patient: string;
  therapist: string;
  therapistSpecialty: string;
  date: string;
  reason: string;
  status: 'Completed' | 'Processing' | 'Rejected' | 'On Hold';
};

// Column definitions
export const bookingColumns: ColumnDef<Booking>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => <div className="text-gray-600">{row.getValue('id')}</div>,
  },
  {
    accessorKey: 'patient',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:bg-transparent p-0"
        >
          Patient
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue('patient')}</div>,
  },
  {
    accessorKey: 'therapist',
    header: 'Therapist',
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.getValue('therapist')}</div>
        <div className="text-sm text-gray-500">{row.original.therapistSpecialty}</div>
      </div>
    ),
  },
  {
    accessorKey: 'date',
    header: 'DATE',
    cell: ({ row }) => <div className="text-gray-600">{row.getValue('date')}</div>,
  },
  {
    accessorKey: 'reason',
    header: 'Reason',
    cell: ({ row }) => <div>{row.getValue('reason')}</div>,
  },
  {
    accessorKey: 'status',
    header: 'STATUS',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;

      return (
        <Badge
          variant="outline"
          className={`px-3 py-1 rounded-md ${
            status === 'Completed'
              ? 'bg-green-100 text-green-800'
              : status === 'Processing'
                ? 'bg-purple-100 text-purple-800'
                : status === 'On Hold'
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-red-100 text-red-800'
          }`}
        >
          {status}
        </Badge>
      );
    },
  },
];

// Sample data for bookings based on the UI
export const sampleBookings: Booking[] = [
  {
    id: '00001',
    patient: 'Christine Brooks',
    therapist: 'Sarah Johnson',
    therapistSpecialty: 'Massage Therapist',
    date: '04 Sep 2019',
    reason: 'BackPain',
    status: 'Completed',
  },
  {
    id: '00002',
    patient: 'Rosie Pearson',
    therapist: 'Sarah Johnson',
    therapistSpecialty: 'Massage Therapist',
    date: '28 May 2019',
    reason: 'Leg Pain',
    status: 'Processing',
  },
  {
    id: '00003',
    patient: 'Darrell Caldwell',
    therapist: 'Sarah Johnson',
    therapistSpecialty: 'Massage Therapist',
    date: '23 Nov 2019',
    reason: 'Chest Pain',
    status: 'Rejected',
  },
  {
    id: '00004',
    patient: 'Gilbert Johnston',
    therapist: 'Sarah Johnson',
    therapistSpecialty: 'Massage Therapist',
    date: '05 Feb 2019',
    reason: 'Arm Pain',
    status: 'Completed',
  },
  {
    id: '00005',
    patient: 'Alan Cain',
    therapist: 'Sarah Johnson',
    therapistSpecialty: 'Massage Therapist',
    date: '29 Jul 2019',
    reason: 'Sprain',
    status: 'Processing',
  },
  {
    id: '00006',
    patient: 'Alfred Murray',
    therapist: 'Sarah Johnson',
    therapistSpecialty: 'Massage Therapist',
    date: '15 Aug 2019',
    reason: 'Fracture',
    status: 'Completed',
  },
  {
    id: '00007',
    patient: 'Maggie Sullivan',
    therapist: 'Sarah Johnson',
    therapistSpecialty: 'Massage Therapist',
    date: '21 Dec 2019',
    reason: 'Stroke',
    status: 'Processing',
  },
  {
    id: '00008',
    patient: 'Rosie Todd',
    therapist: 'Sarah Johnson',
    therapistSpecialty: 'Massage Therapist',
    date: '30 Apr 2019',
    reason: 'Back Pain',
    status: 'On Hold',
  },
];

// Define stats data
const bookingStats = [
  {
    title: "Today's Appointments",
    value: '40',
    trend: { value: 5.2, isUp: true, timeframe: 'yesterday' },
    icon: <Image src="/svgs/UsersIcon.svg" alt="Users" width={24} height={24} />,
    bgColor: '#e8ebfd',
  },
  {
    title: 'Canceled Appointments',
    value: '05',
    trend: { value: 2.1, isUp: false, timeframe: 'last week' },
    icon: <Image src="/svgs/ClientsIcon.svg" alt="Clients" width={24} height={24} />,
    bgColor: '#fde8e7',
  },
  {
    title: 'Therapists Online',
    value: '20',
    trend: { value: 8.3, isUp: true, timeframe: 'last month' },
    icon: <Image src="/svgs/CalendarIcon.svg" alt="Calendar" width={24} height={24} />,
    bgColor: '#e7fdf1',
  },
];

const BookingsPage = () => {
  return (
    <DashboardPageWrapper header={<h2 className="text-xl font-semibold">Bookings</h2>}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {bookingStats.map((stat, index) => (
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

      {/* Bookings Table */}
      <DataTable
        columns={bookingColumns}
        data={sampleBookings}
        title="All Bookings"
        searchKey="patient"
        searchPlaceholder="Search bookings..."
        enableSorting={true}
        enableFiltering={true}
        enableColumnVisibility={true}
        enablePagination={true}
        pageSize={8}
        pageSizeOptions={[5, 10, 20, 30, 40]}
      />
    </DashboardPageWrapper>
  );
};

export default BookingsPage;
