'use client';

import { ColumnDef } from '@tanstack/react-table';
import { format, parseISO } from 'date-fns';
import { Calendar, MessageSquare, MoreHorizontal, Star, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Booking } from '@/types/booking';

interface BookingTableColumnsProps {
  onBookingClick: (booking: Booking) => void;
  onMessage: (booking: Booking) => void;
  onReschedule: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
  onRate: (booking: Booking) => void;
  cancellingBookingId: string | null;
}

export const createBookingColumns = ({
  onBookingClick,
  onMessage,
  onReschedule,
  onCancel,
  onRate,
  cancellingBookingId,
}: BookingTableColumnsProps): ColumnDef<Booking, unknown>[] => {
  return [
    {
      accessorKey: 'slot.startTime',
      header: 'Date & Time',
      cell: ({ row }) => {
        const startTime = parseISO(row.original.slot.startTime);
        return (
          <div className="flex flex-col">
            <span className="font-medium text-charcoal dark:text-white">
              {format(startTime, 'MMM d, yyyy')}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {format(startTime, 'h:mm a')}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'slot.freelancer.name',
      header: 'Name',
      cell: ({ row }) => {
        const { freelancer } = row.original.slot;
        return (
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="font-medium text-charcoal dark:text-white">{freelancer.name}</span>
              {freelancer.averageRating && (
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  ⭐ {freelancer.averageRating.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'slot.freelancer.email',
      header: 'Email',
      cell: ({ row }) => {
        const { freelancer } = row.original.slot;
        return (
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="font-medium text-charcoal dark:text-white">{freelancer.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'serviceCategories',
      header: 'Service',
      cell: ({ row }) => {
        const serviceCategories = row.original.serviceCategories || row.original.services || [];
        if (serviceCategories.length === 0) {
          return <span className="text-gray-500">No service</span>;
        }
        return (
          <div className="flex flex-col gap-1">
            {serviceCategories.slice(0, 2).map((service, idx) => (
              <span key={idx} className="text-sm text-charcoal dark:text-white">
                {service.name}
              </span>
            ))}
            {serviceCategories.length > 2 && (
              <span className="text-xs text-gray-500">+{serviceCategories.length - 2} more</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'slot.locationType',
      header: 'Location',
      cell: ({ row }) => {
        const { locationType } = row.original.slot;
        const { location } = row.original.slot;
        return (
          <div className="flex flex-col">
            <Badge variant="outline" className="w-fit">
              {locationType === 'HOME' ? 'Home' : 'Clinic'}
            </Badge>
            {location && (
              <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">{location.name}</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const { status } = row.original;
        const startTime = parseISO(row.original.slot.startTime);
        const isPast = startTime < new Date();
        const isUpcoming = status === 'CONFIRMED' && !isPast;

        let statusLabel = status;
        let statusClass = '';

        if (isUpcoming) {
          statusLabel = 'CONFIRMED';
          statusClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        } else if (status === 'COMPLETED' || (status === 'CONFIRMED' && isPast)) {
          statusLabel = 'COMPLETED';
          statusClass = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        } else if (status === 'CANCELLED') {
          statusLabel = 'CANCELLED';
          statusClass = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        } else if (status === 'RESCHEDULED') {
          statusLabel = 'RESCHEDULED';
          statusClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        }

        return <Badge className={cn('font-semibold', statusClass)}>{statusLabel}</Badge>;
      },
    },
    {
      accessorKey: 'totalAmount',
      header: 'Amount',
      cell: ({ row }) => {
        return (
          <span className="font-semibold text-charcoal dark:text-white">
            €{row.original.totalAmount.toFixed(2)}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const booking = row.original;
        const startTime = parseISO(booking.slot.startTime);
        const isPast = startTime < new Date();
        const isUpcoming = booking.status === 'CONFIRMED' && !isPast;
        const isCancelled = booking.status === 'CANCELLED';
        const isCancelling = cancellingBookingId === booking.id;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0" disabled={isCancelling}>
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onBookingClick(booking)}>
                <Calendar className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              {isUpcoming && (
                <>
                  <DropdownMenuItem onClick={() => onMessage(booking)}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message Therapist
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onReschedule(booking)}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Reschedule
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onCancel(booking)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </DropdownMenuItem>
                </>
              )}
              {isPast && !isCancelled && booking.canBeRated && !booking.hasRating && (
                <DropdownMenuItem onClick={() => onRate(booking)}>
                  <Star className="mr-2 h-4 w-4" />
                  Rate & Review
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
