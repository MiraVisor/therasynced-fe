'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

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
  freelancerId?: string;
  id: string;
  name: string;
  date: string;
  time: string;
  email: string;
  price: number;
  ratings?: number | null;
  ratingReview?: string | null;
  hasRating?: boolean;
  status: 'Confirmed' | 'Cancelled' | 'Completed';
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
      let badgeClass = '';
      let badgeVariant: 'default' | 'secondary' = 'default';
      if (status === 'Confirmed') {
        badgeClass = 'bg-green-100 text-green-800 hover:bg-green-100';
        badgeVariant = 'default';
      } else if (status === 'Cancelled') {
        badgeClass = 'bg-red-100 text-red-800 hover:bg-red-100';
        badgeVariant = 'secondary';
      } else if (status === 'Completed') {
        badgeClass = 'bg-purple-100 text-purple-800 hover:bg-purple-100';
        badgeVariant = 'secondary';
      }
      return (
        <Badge variant={badgeVariant} className={badgeClass}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'ratings',
    header: 'Rating',
    cell: ({ row }) => {
      const rating = row.original.ratings;
      const review = row.original.ratingReview;
      if (rating) {
        return (
          <div className="flex flex-col items-start">
            <span className="flex items-center text-yellow-500 font-semibold">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i}>{i < rating ? '★' : '☆'}</span>
              ))}
              <span className="ml-2 text-gray-700">{rating}/5</span>
            </span>
            {review && <span className="text-xs text-gray-500 mt-1">&quot;{review}&quot;</span>}
          </div>
        );
      }
      return <span className="text-gray-400 italic">No rating given</span>;
    },
    enableSorting: false,
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
    status: 'Confirmed',
  },
  {
    id: '2',
    name: 'Floyd Miles',
    date: '02-04-2025',
    time: '18:00',
    email: 'floyd@yahoo.com',
    price: 100,
    status: 'Cancelled',
  },
  {
    id: '3',
    name: 'Ronald Richards',
    date: '03-04-2025',
    time: '18:00',
    email: 'ronald@adobe.com',
    price: 300,
    status: 'Cancelled',
  },
  {
    id: '4',
    name: 'Marvin McKinney',
    date: '04-04-2025',
    time: '20:00',
    email: 'marvin@tesla.com',
    price: 500,
    status: 'Confirmed',
  },
  {
    id: '5',
    name: 'Jerome Bell',
    date: '05-04-2025',
    time: '21:00',
    email: 'jerome@google.com',
    price: 150,
    status: 'Completed',
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
