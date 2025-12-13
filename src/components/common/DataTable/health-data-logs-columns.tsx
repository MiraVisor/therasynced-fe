'use client';

import { ColumnDef } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import { HealthDataAccessLog } from '@/redux/api/dataRightsApi';

export const formatLogDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getActionBadgeVariant = (
  action: string,
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (action) {
    case 'ACCESS':
      return 'default';
    case 'EDIT':
      return 'secondary';
    case 'DELETE':
      return 'destructive';
    default:
      return 'outline';
  }
};

export const getDataTypeLabel = (dataType: string) => {
  switch (dataType) {
    case 'booking':
      return 'Booking';
    case 'complaint':
      return 'Complaint';
    case 'consent':
      return 'Consent';
    case 'data-rights':
      return 'Data Rights';
    case 'profile':
      return 'Profile';
    default:
      return dataType;
  }
};

// User view columns (without data owner column)
export const userHealthDataLogsColumns: ColumnDef<HealthDataAccessLog>[] = [
  {
    accessorKey: 'accessedAt',
    header: 'Date & Time',
    cell: ({ row }) => (
      <div className="font-inter text-sm text-charcoal">
        {formatLogDate(row.original.accessedAt)}
      </div>
    ),
  },
  {
    accessorKey: 'dataType',
    header: 'Data Type',
    cell: ({ row }) => (
      <Badge variant="outline" className="font-inter text-sm">
        {getDataTypeLabel(row.original.dataType)}
      </Badge>
    ),
  },
  {
    accessorKey: 'action',
    header: 'Action',
    cell: ({ row }) => (
      <Badge variant={getActionBadgeVariant(row.original.action)} className="font-inter text-sm">
        {row.original.action}
      </Badge>
    ),
  },
  {
    accessorKey: 'accessedByUser',
    header: 'Accessed By',
    cell: ({ row }) => (
      <div>
        <div className="font-inter font-medium text-sm text-charcoal">
          {row.original.accessedByUser.name}
        </div>
        <div className="font-inter text-xs text-muted-foreground">
          {row.original.accessedByUser.email}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'purpose',
    header: 'Purpose',
    cell: ({ row }) => (
      <div
        className="font-inter text-sm text-charcoal max-w-xs truncate"
        title={row.original.purpose}
      >
        {row.original.purpose}
      </div>
    ),
  },
  {
    accessorKey: 'ipAddress',
    header: 'IP Address',
    cell: ({ row }) => (
      <div className="font-inter text-sm text-muted-foreground">
        {row.original.ipAddress || 'N/A'}
      </div>
    ),
  },
];

// Admin view columns (includes data owner column)
export const adminHealthDataLogsColumns: ColumnDef<HealthDataAccessLog>[] = [
  {
    accessorKey: 'accessedAt',
    header: 'Date & Time',
    cell: ({ row }) => (
      <div className="font-inter text-sm text-charcoal">
        {formatLogDate(row.original.accessedAt)}
      </div>
    ),
  },
  {
    accessorKey: 'user',
    header: 'Data Owner',
    cell: ({ row }) => (
      <div>
        <div className="font-inter font-medium text-sm text-charcoal">{row.original.user.name}</div>
        <div className="font-inter text-xs text-muted-foreground">{row.original.user.email}</div>
      </div>
    ),
  },
  {
    accessorKey: 'accessedByUser',
    header: 'Accessed By',
    cell: ({ row }) => (
      <div>
        <div className="font-inter font-medium text-sm text-charcoal">
          {row.original.accessedByUser.name}
        </div>
        <div className="font-inter text-xs text-muted-foreground">
          {row.original.accessedByUser.email}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'dataType',
    header: 'Data Type',
    cell: ({ row }) => (
      <Badge variant="outline" className="font-inter text-sm">
        {getDataTypeLabel(row.original.dataType)}
      </Badge>
    ),
  },
  {
    accessorKey: 'action',
    header: 'Action',
    cell: ({ row }) => (
      <Badge variant={getActionBadgeVariant(row.original.action)} className="font-inter text-sm">
        {row.original.action}
      </Badge>
    ),
  },
  {
    accessorKey: 'purpose',
    header: 'Purpose',
    cell: ({ row }) => (
      <div
        className="font-inter text-sm text-charcoal max-w-xs truncate"
        title={row.original.purpose}
      >
        {row.original.purpose}
      </div>
    ),
  },
  {
    accessorKey: 'ipAddress',
    header: 'IP Address',
    cell: ({ row }) => (
      <div className="font-inter text-sm text-muted-foreground">
        {row.original.ipAddress || 'N/A'}
      </div>
    ),
  },
];
