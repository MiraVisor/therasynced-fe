'use client';

import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ArrowUpDown, Edit, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LocationType, Slot } from '@/types/types';

// Status configuration using Slot status type

// Location type configuration using LocationType enum
const getLocationTypeConfig = (locationType: LocationType) => {
  const configs = {
    [LocationType.VIRTUAL]: {
      label: 'Virtual',
    },
    [LocationType.HOME]: {
      label: 'Home Visit',
    },
    [LocationType.OFFICE]: {
      label: 'Office',
    },
    [LocationType.CLINIC]: {
      label: 'Clinic',
    },
  };
  return configs[locationType];
};

export const createSlotsColumns = (onDeleteSlot?: (slot: Slot) => void): ColumnDef<Slot>[] => [
  {
    accessorKey: 'startTime',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="font-semibold text-sm text-black text-left hover:bg-transparent p-0"
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue('startTime'));

      return (
        <div className="font-medium text-gray-900 text-sm whitespace-nowrap text-left">
          {format(date, 'MMM d, yyyy')}
        </div>
      );
    },
  },
  {
    accessorKey: 'startTime',
    header: () => {
      return <div className="font-semibold text-sm text-black text-left">Time</div>;
    },
    cell: ({ row }) => {
      const startTime = new Date(row.getValue('startTime'));
      const endTime = new Date(row.original.endTime);

      return (
        <div className="text-sm text-gray-600 whitespace-nowrap text-left">
          {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
        </div>
      );
    },
  },
  {
    accessorKey: 'locationType',
    header: () => {
      return <div className="font-semibold text-sm text-black text-left">Location</div>;
    },
    cell: ({ row }) => {
      const locationType = row.getValue('locationType') as LocationType;
      const config = getLocationTypeConfig(locationType);

      return (
        <div className="flex items-center gap-1 text-sm text-gray-700 whitespace-nowrap text-left">
          <span className="text-sm">{config.label}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'basePrice',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="font-semibold text-sm text-black text-left hover:bg-transparent p-0"
        >
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('basePrice'));

      return (
        <div className="font-medium text-gray-900 text-sm whitespace-nowrap text-left">
          €{price}
        </div>
      );
    },
  },
  {
    accessorKey: 'duration',
    header: () => {
      return <div className="font-semibold text-sm text-black text-left">Duration</div>;
    },
    cell: ({ row }) => {
      const duration = row.getValue('duration') as number;
      return (
        <div className="text-sm text-gray-600 whitespace-nowrap text-left">{duration} min</div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: () => {
      return <div className="font-semibold text-sm text-black text-left">Status</div>;
    },
    cell: ({ row }) => {
      const status = row.getValue('status') as string;

      let badgeProps = {
        variant: 'secondary' as 'default' | 'secondary',
        className: 'text-sm',
        label: status,
      };

      switch (status) {
        case 'AVAILABLE':
          badgeProps = {
            variant: 'default',
            className: 'bg-green-100 text-green-800 hover:bg-green-100 text-sm',
            label: 'Available',
          };
          break;
        case 'BOOKED':
          badgeProps = {
            variant: 'secondary',
            className: 'bg-blue-100 text-blue-800 hover:bg-blue-100 text-sm',
            label: 'Booked',
          };
          break;
        case 'RESERVED':
          badgeProps = {
            variant: 'secondary',
            className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-sm',
            label: 'Reserved',
          };
          break;
        case 'CANCELLED':
          badgeProps = {
            variant: 'secondary',
            className: 'bg-gray-200 text-gray-700 hover:bg-gray-200 text-sm',
            label: 'Cancelled',
          };
          break;
        default:
          badgeProps = {
            variant: 'secondary',
            className: 'bg-red-100 text-red-800 hover:bg-red-100 text-sm',
            label: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
          };
      }

      return (
        <Badge variant={badgeProps.variant} className={badgeProps.className}>
          {badgeProps.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'notes',
    header: () => {
      return <div className="font-semibold text-sm text-black text-left">Notes</div>;
    },
    cell: ({ row }) => {
      const notes = row.getValue('notes') as string;

      if (!notes) {
        return <span className="text-gray-400 text-sm text-left">-</span>;
      }

      return (
        <div className="max-w-xs text-sm text-gray-600 leading-relaxed text-left">{notes}</div>
      );
    },
  },
  {
    id: 'actions',
    header: () => {
      return <div className="font-semibold text-sm text-black text-left">Actions</div>;
    },
    cell: ({ row }) => {
      const slot = row.original;
      const isTemp = slot.id.startsWith('temp-');

      return (
        <div className="flex items-center gap-2 whitespace-nowrap text-left">
          {slot.status === 'AVAILABLE' && !isTemp && (
            <>
              <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0 border-red-200 text-red-600 hover:bg-red-50"
                onClick={() => onDeleteSlot?.(slot)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
          {isTemp && <div className="text-xs text-gray-400">Creating...</div>}
        </div>
      );
    },
  },
];
