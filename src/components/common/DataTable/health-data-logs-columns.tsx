'use client';

import { AlertTriangle, User } from 'lucide-react';
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

const getRoleBadgeVariant = (role?: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (role) {
    case 'FREELANCER':
      return 'default'; // Blue
    case 'ADMIN':
      return 'destructive'; // Red/Orange
    case 'PATIENT':
    default:
      return 'outline'; // Gray/Neutral
  }
};

const getRoleLabel = (role?: string): string => {
  switch (role) {
    case 'FREELANCER':
      return 'FREELANCER';
    case 'ADMIN':
      return 'ADMIN';
    case 'PATIENT':
      return 'PATIENT';
    default:
      return role || 'UNKNOWN';
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
    cell: ({ row }) => {
      const log = row.original;
      const isSelfAccess = log.isSelfAccess ?? false;
      const accessedBy = log.accessedByUser;
      const role = accessedBy.role;
      const isThirdParty = !isSelfAccess && (role === 'FREELANCER' || role === 'ADMIN');

      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            {isSelfAccess ? (
              <User className="h-3 w-3 text-gray-500" />
            ) : isThirdParty ? (
              <AlertTriangle className="h-3 w-3 text-amber-600" />
            ) : null}
            <span
              className={`font-inter font-medium text-sm ${
                isThirdParty ? 'text-amber-700 dark:text-amber-400' : 'text-charcoal'
              }`}
            >
              {isSelfAccess ? 'You (Self)' : accessedBy.name}
            </span>
            {isSelfAccess ? (
              <Badge variant="outline" className="font-inter text-xs text-gray-500">
                Self-Access
              </Badge>
            ) : (
              <Badge variant="secondary" className="font-inter text-xs text-amber-700 dark:text-amber-400">
                Third-Party Access
              </Badge>
            )}
          </div>
          {!isSelfAccess && (
            <div className="font-inter text-xs text-muted-foreground">
              {accessedBy.email}
            </div>
          )}
        </div>
      );
    },
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
    cell: ({ row }) => {
      const user = row.original.user;
      const role = user.role;

      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-inter font-medium text-sm text-charcoal">{user.name}</span>
            {role && (
              <Badge
                variant={getRoleBadgeVariant(role)}
                className="font-inter text-xs"
              >
                {getRoleLabel(role)}
              </Badge>
            )}
          </div>
          <div className="font-inter text-xs text-muted-foreground">{user.email}</div>
        </div>
      );
    },
  },
  {
    accessorKey: 'accessedByUser',
    header: 'Accessed By',
    cell: ({ row }) => {
      const log = row.original;
      const accessedBy = log.accessedByUser;
      const role = accessedBy.role;
      const isSelfAccess = log.isSelfAccess ?? false;

      const isThirdParty = !isSelfAccess && (role === 'FREELANCER' || role === 'ADMIN');

      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            {isSelfAccess ? (
              <User className="h-3 w-3 text-gray-500" />
            ) : isThirdParty ? (
              <AlertTriangle className="h-3 w-3 text-amber-600" />
            ) : null}
            <span
              className={`font-inter font-medium text-sm ${
                isThirdParty ? 'text-amber-700 dark:text-amber-400' : 'text-charcoal'
              }`}
            >
              {isSelfAccess ? 'You (Self)' : accessedBy.name}
            </span>
            {isSelfAccess ? (
              <Badge variant="outline" className="font-inter text-xs text-gray-500">
                Self-Access
              </Badge>
            ) : (
              <Badge variant="secondary" className="font-inter text-xs text-amber-700 dark:text-amber-400">
                Third-Party Access
              </Badge>
            )}
          </div>
          {!isSelfAccess && (
            <div className="font-inter text-xs text-muted-foreground">
              {accessedBy.email}
            </div>
          )}
        </div>
      );
    },
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
