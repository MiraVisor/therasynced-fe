'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Calendar, Users, XCircle } from 'lucide-react';

import { DataTable } from '@/components/common/DataTable/data-table';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Badge } from '@/components/ui/badge';
import { EnhancedStatCard } from '@/components/ui/enhanced-stat-card';

// ----------------------
// 📊 Mock Stats
// ----------------------
const mockStats = [
  {
    title: "Today's Appointments",
    value: '40',
    trend: { value: 0, isUp: true, label: 'today' },
    icon: Calendar,
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
    sparklineData: [35, 38, 40, 38, 42, 40, 40],
  },
  {
    title: 'Canceled Appointments',
    value: '05',
    trend: { value: 0, isUp: false, label: 'today' },
    icon: XCircle,
    iconColor: 'text-error',
    iconBg: 'bg-error/10',
    sparklineData: [7, 6, 5, 6, 5, 5, 5],
  },
  {
    title: 'Therapists Online',
    value: '20',
    trend: { value: 0, isUp: true, label: 'now' },
    icon: Users,
    iconColor: 'text-success',
    iconBg: 'bg-success/10',
    sparklineData: [18, 19, 20, 19, 21, 20, 20],
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
type Booking = (typeof mockBookings)[0];

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
      header={<h1 className="font-poppins font-bold text-2xl text-charcoal">Appointments</h1>}
    >
      <div className="space-y-6 lg:space-y-8">
        {/* 🔹 Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockStats.map((stat, index) => {
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
                sparklineData={stat.sparklineData}
                interactive
                onClick={() => {
                  // Navigate to details or show modal
                }}
              />
            );
          })}
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
