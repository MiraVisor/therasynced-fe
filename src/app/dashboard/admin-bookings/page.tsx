'use client';

import Image from 'next/image';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { StatsCard } from '@/components/core/Dashboard/AdminSide/Cards/StatsCard';
import { DataTable } from '@/components/common/DataTable/data-table';
import { Badge } from '@/components/ui/badge';
import type { ColumnDef } from '@tanstack/react-table';

// ----------------------
// 📊 Mock Stats
// ----------------------
const mockStats = [
  {
    title: "Today's Appointments",
    value: '40',
    trend: { value: 0, isUp: true, timeframe: 'today' },
    icon: '/svgs/UsersIcon.svg',
    bgColor: '#e5e4ff',
  },
  {
    title: 'Canceled Appointments',
    value: '05',
    trend: { value: 0, isUp: false, timeframe: 'today' },
    icon: '/svgs/ClientsIcon.svg',
    bgColor: '#ffe5e5',
  },
  {
    title: 'Therapists Online',
    value: '20',
    trend: { value: 0, isUp: true, timeframe: 'now' },
    icon: '/svgs/CalendarIcon.svg',
    bgColor: '#d9f7e8',
  },
];

// ----------------------
// 📋 Mock Table Data
// ----------------------
const mockBookings = [
  {
    id: '00001',
    patient: 'Christine Brooks',
    therapist: 'Sarah Johnson',
    date: '04 Sep 2019',
    reason: 'BackPain',
    status: 'Completed',
  },
  {
    id: '00002',
    patient: 'Rosie Pearson',
    therapist: 'Sarah Johnson',
    date: '28 May 2019',
    reason: 'Leg Pain',
    status: 'Processing',
  },
  {
    id: '00003',
    patient: 'Darrell Caldwell',
    therapist: 'Sarah Johnson',
    date: '23 Nov 2019',
    reason: 'Chest Pain',
    status: 'Rejected',
  },
  {
    id: '00004',
    patient: 'Gilbert Johnston',
    therapist: 'Sarah Johnson',
    date: '05 Feb 2019',
    reason: 'Arm Pain',
    status: 'Completed',
  },
];

// ----------------------
// ✅ Booking Table Columns
// ----------------------
type Booking = typeof mockBookings[0];

const bookingColumns: ColumnDef<Booking>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'patient', header: 'Patient' },
  { accessorKey: 'therapist', header: 'Therapist' },
  { accessorKey: 'date', header: 'Date' },
  { accessorKey: 'reason', header: 'Reason' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status;

      const statusStyles: Record<string, string> = {
        Completed: 'bg-green-100 text-green-800',
        Processing: 'bg-purple-100 text-purple-800',
        Rejected: 'bg-red-100 text-red-800',
        'On Hold': 'bg-yellow-100 text-yellow-800',
      };

      return (
        <Badge
          className={`px-3 py-1 rounded-md text-xs ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}
          variant="outline"
        >
          {status}
        </Badge>
      );
    },
  },
];

export default function AdminBookingsPage() {
  return (
    <DashboardPageWrapper
      header={
        <h1 className="font-open-sans font-semibold text-[24px] leading-[100%] text-black">
          Appointments
        </h1>
      }
    >
      <div className="space-y-6">
        {/* 🔹 Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockStats.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              trend={stat.trend}
              icon={<Image src={stat.icon} alt={stat.title} width={24} height={24} />}
              bgColor={stat.bgColor}
            />
          ))}
        </div>

        {/* 📋 Appointments Table */}
        <DataTable
          columns={bookingColumns}
          data={mockBookings}
          title="Appointment Bookings"
          searchKey="patient"
          searchPlaceholder="Search by patient name"
          enablePagination={true}
          pageSize={10}
        />
      </div>
    </DashboardPageWrapper>
  );
}
