'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

import { DataTable } from '@/components/common/DataTable/data-table';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Define the therapist type based on the UI
export type Therapist = {
  id: string;
  name: string;
  email: string;
  specialization: string;
  rating: number;
  availability: string;
  patients: number;
  status: 'Completed' | 'Processing' | 'Rejected';
};

// Column definitions for therapists table
export const therapistColumns: ColumnDef<Therapist>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:bg-transparent p-0"
        >
          Therapists
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
          {String(row.getValue('name')).charAt(0)}
        </div>
        <div>
          <div className="font-medium">{row.getValue('name') as string}</div>
          <div className="text-sm text-gray-500">{row.original.email}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'specialization',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:bg-transparent p-0"
        >
          Specialization
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue('specialization')}</div>,
  },
  {
    accessorKey: 'rating',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:bg-transparent p-0"
        >
          Rating
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const rating = row.getValue('rating') as number;
      return (
        <div className="flex">
          {Array(5)
            .fill(0)
            .map((_, index) => (
              <span key={index} className="text-yellow-400">
                {index < rating ? '★' : '☆'}
              </span>
            ))}
        </div>
      );
    },
  },
  {
    accessorKey: 'availability',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:bg-transparent p-0"
        >
          Availability
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue('availability')}</div>,
  },
  {
    accessorKey: 'patients',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:bg-transparent p-0"
        >
          Patients
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="text-center">{row.getValue('patients')}</div>,
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
                : 'bg-red-100 text-red-800'
          }`}
        >
          {status}
        </Badge>
      );
    },
  },
];

// Sample data for therapists
export const sampleTherapists: Therapist[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah123@gmail.com',
    specialization: 'Massage Therapist',
    rating: 5,
    availability: 'Available Today',
    patients: 5,
    status: 'Completed',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah123@gmail.com',
    specialization: 'Massage Therapist',
    rating: 3,
    availability: 'Available Today',
    patients: 5,
    status: 'Processing',
  },
  {
    id: '3',
    name: 'Sarah Johnson',
    email: 'sarah123@gmail.com',
    specialization: 'Massage Therapist',
    rating: 2,
    availability: 'Available Today',
    patients: 5,
    status: 'Rejected',
  },
  {
    id: '4',
    name: 'Sarah Johnson',
    email: 'sarah123@gmail.com',
    specialization: 'Massage Therapist',
    rating: 1,
    availability: 'Available Today',
    patients: 5,
    status: 'Completed',
  },
  {
    id: '5',
    name: 'Sarah Johnson',
    email: 'sarah123@gmail.com',
    specialization: 'Massage Therapist',
    rating: 5,
    availability: 'Available Today',
    patients: 5,
    status: 'Processing',
  },
  {
    id: '6',
    name: 'Sarah Johnson',
    email: 'sarah123@gmail.com',
    specialization: 'Massage Therapist',
    rating: 5,
    availability: 'Available Today',
    patients: 5,
    status: 'Completed',
  },
];

const TherapistsPage = () => {
  return (
    <DashboardPageWrapper
      header={
        <div className="flex items-center space-x-2">
          <h2 className="font-poppins text-[22px] font-bold tracking-tight">
            <span className="text-black">{'All'} </span>
            <span className="text-primary">{'Therapists'}</span>
          </h2>
        </div>
      }
    >
      <DataTable
        columns={therapistColumns}
        data={sampleTherapists}
        searchKey="name"
        searchPlaceholder="Search therapists..."
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

export default TherapistsPage;
