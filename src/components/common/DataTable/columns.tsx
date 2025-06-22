'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';

// Define the booking type based on your UI
export type Booking = {
  id: string;
  name: string;
  date: string;
  time: string;
  email: string;
  price: number;
  status: 'Active' | 'Inactive';
};

export const bookingColumns: ColumnDef<Booking>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:bg-transparent p-0"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'date',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:bg-transparent p-0"
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="text-gray-600">{row.getValue('date')}</div>,
  },
  {
    accessorKey: 'time',
    header: 'Time',
    cell: ({ row }) => <div className="text-gray-600">{row.getValue('time')}</div>,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => <div className="text-gray-600">{row.getValue('email')}</div>,
  },
  {
    accessorKey: 'price',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:bg-transparent p-0"
        >
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('price'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(price);

      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge
          variant={status === 'Active' ? 'default' : 'secondary'}
          className={
            status === 'Active'
              ? 'bg-green-100 text-green-800 hover:bg-green-100'
              : 'bg-red-100 text-red-800 hover:bg-red-100'
          }
        >
          {status}
        </Badge>
      );
    },
  },

  //   {
  //     id: 'actions',
  //     cell: ({ row }) => {
  //       const booking = row.original;

  //       return (
  //         <DropdownMenu>
  //           <DropdownMenuTrigger asChild>
  //             <Button variant="ghost" className="h-8 w-8 p-0">
  //               <span className="sr-only">Open menu</span>
  //               <MoreHorizontal className="h-4 w-4" />
  //             </Button>
  //           </DropdownMenuTrigger>
  //           <DropdownMenuContent align="end">
  //             <DropdownMenuLabel>Actions</DropdownMenuLabel>
  //             <DropdownMenuItem onClick={() => navigator.clipboard.writeText(booking.id)}>
  //               Copy booking ID
  //             </DropdownMenuItem>
  //             <DropdownMenuSeparator />
  //             <DropdownMenuItem>View booking</DropdownMenuItem>
  //             <DropdownMenuItem>Edit booking</DropdownMenuItem>
  //             <DropdownMenuItem className="text-red-600">Cancel booking</DropdownMenuItem>
  //           </DropdownMenuContent>
  //         </DropdownMenu>
  //       );
  //     },
  //   },
];

// Sample data for testing
export const sampleBookings: Booking[] = [
  {
    id: '1',
    name: 'Jane Cooper',
    date: '01-04-2025',
    time: '17:00',
    email: 'jane@microsoft.com',
    price: 200,
    status: 'Active',
  },
  {
    id: '2',
    name: 'Floyd Miles',
    date: '02-04-2025',
    time: '18:00',
    email: 'floyd@yahoo.com',
    price: 100,
    status: 'Inactive',
  },
  {
    id: '3',
    name: 'Ronald Richards',
    date: '03-04-2025',
    time: '18:00',
    email: 'ronald@adobe.com',
    price: 300,
    status: 'Inactive',
  },
  {
    id: '4',
    name: 'Marvin McKinney',
    date: '04-04-2025',
    time: '20:00',
    email: 'marvin@tesla.com',
    price: 500,
    status: 'Active',
  },
  {
    id: '5',
    name: 'Jerome Bell',
    date: '05-04-2025',
    time: '10:00',
    email: 'jerome@google.com',
    price: 600,
    status: 'Active',
  },
  {
    id: '6',
    name: 'Kathryn Murphy',
    date: '06-04-2025',
    time: '11:00',
    email: 'kathryn@microsoft.com',
    price: 700,
    status: 'Active',
  },
  {
    id: '7',
    name: 'Jacob Jones',
    date: '07-04-2025',
    time: '12:00',
    email: 'jacob@yahoo.com',
    price: 800,
    status: 'Active',
  },
  {
    id: '8',
    name: 'Kristin Watson',
    date: '08-04-2025',
    time: '13:00',
    email: 'kristin@facebook.com',
    price: 900,
    status: 'Inactive',
  },
  {
    id: '9',
    name: 'Sarah Johnson',
    date: '09-04-2025',
    time: '14:00',
    email: 'sarah@amazon.com',
    price: 450,
    status: 'Active',
  },
  {
    id: '10',
    name: 'Michael Brown',
    date: '10-04-2025',
    time: '15:00',
    email: 'michael@netflix.com',
    price: 320,
    status: 'Active',
  },
  {
    id: '11',
    name: 'Emma Wilson',
    date: '11-04-2025',
    time: '16:00',
    email: 'emma@spotify.com',
    price: 280,
    status: 'Inactive',
  },
  {
    id: '12',
    name: 'David Garcia',
    date: '12-04-2025',
    time: '17:00',
    email: 'david@uber.com',
    price: 650,
    status: 'Active',
  },
  {
    id: '13',
    name: 'Lisa Anderson',
    date: '13-04-2025',
    time: '18:00',
    email: 'lisa@airbnb.com',
    price: 750,
    status: 'Active',
  },
  {
    id: '14',
    name: 'James Martinez',
    date: '14-04-2025',
    time: '19:00',
    email: 'james@twitter.com',
    price: 420,
    status: 'Inactive',
  },
  {
    id: '15',
    name: 'Anna Taylor',
    date: '15-04-2025',
    time: '20:00',
    email: 'anna@linkedin.com',
    price: 580,
    status: 'Active',
  },
];

// Legacy export for backward compatibility
export type Payment = {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'success' | 'failed';
  email: string;
};

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: 'status',
    header: 'Status',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
  },
];
