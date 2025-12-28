'use client';

import { format } from 'date-fns';
import { Calendar, Clock } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Slot } from '@/types/types';

interface SlotsTableProps {
  slots: Slot[];
  isLoading?: boolean;
}

export const SlotsTable = ({ slots, isLoading }: SlotsTableProps) => {
  const getDayName = (date: Date): string => {
    return format(date, 'EEEE');
  };

  const getStatusBadge = (status: Slot['status']) => {
    const variants: Record<
      Slot['status'],
      { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
    > = {
      AVAILABLE: { label: 'Available', variant: 'default' },
      RESERVED: { label: 'Reserved', variant: 'secondary' },
      BOOKED: { label: 'Booked', variant: 'outline' },
      CANCELLED: { label: 'Cancelled', variant: 'destructive' },
    };

    const config = variants[status];
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="border rounded-lg p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center text-muted-foreground">
        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-sm">No slots available</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Date</TableHead>
            <TableHead className="w-[120px]">Day</TableHead>
            <TableHead className="w-[150px]">Start Time</TableHead>
            <TableHead className="w-[150px]">End Time</TableHead>
            <TableHead className="w-[100px]">Duration</TableHead>
            <TableHead className="w-[120px]">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {slots.map((slot) => {
            const startDate = new Date(slot.startTime);
            const endDate = new Date(slot.endTime);

            return (
              <TableRow key={slot.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{format(startDate, 'MMM d, yyyy')}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">{getDayName(startDate)}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{format(startDate, 'h:mm a')}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{format(endDate, 'h:mm a')}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">{slot.duration} min</span>
                </TableCell>
                <TableCell>{getStatusBadge(slot.status)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
