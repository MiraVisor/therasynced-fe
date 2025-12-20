'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Lock, Unlock } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { ExportLog } from '@/services/exportService';

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

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const exportLogsColumns: ColumnDef<ExportLog>[] = [
  {
    accessorKey: 'createdAt',
    header: 'Date & Time',
    cell: ({ row }) => {
      const date = row.original.createdAt || row.original.exportedAt;
      if (!date) {
        return <div className="font-inter text-sm text-muted-foreground">N/A</div>;
      }
      return <div className="font-inter text-sm text-charcoal">{formatLogDate(date)}</div>;
    },
  },
  {
    accessorKey: 'exportedByUser',
    header: 'Exported By',
    cell: ({ row }) => {
      const exportedByUser = row.original.exportedByUser;
      if (!exportedByUser) {
        return <div className="font-inter text-sm text-muted-foreground">N/A</div>;
      }
      return (
        <div className="space-y-1">
          <div className="font-inter font-medium text-sm text-charcoal">
            {exportedByUser.name || 'Unknown'}
          </div>
          <div className="font-inter text-xs text-muted-foreground">
            {exportedByUser.email || 'N/A'}
          </div>
          {exportedByUser.role && (
            <Badge variant="outline" className="font-inter text-xs mt-1">
              {exportedByUser.role}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'exportedUser',
    header: 'User Exported',
    cell: ({ row }) => {
      const exportedUser = row.original.exportedUser;
      if (!exportedUser) {
        return <div className="font-inter text-sm text-muted-foreground">N/A</div>;
      }
      return (
        <div className="space-y-1">
          <div className="font-inter font-medium text-sm text-charcoal">
            {exportedUser.name || 'Unknown'}
          </div>
          <div className="font-inter text-xs text-muted-foreground">
            {exportedUser.email || 'N/A'}
          </div>
          {exportedUser.role && (
            <Badge variant="outline" className="font-inter text-xs mt-1">
              {exportedUser.role}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'exportType',
    header: 'Export Type',
    cell: ({ row }) => {
      const exportType = row.original.exportType;
      // Map API export types to display names
      const displayType =
        exportType === 'BULK_USER_DATA'
          ? 'BULK EXPORT'
          : exportType === 'USER_DATA'
            ? 'USER EXPORT'
            : exportType;
      const isAdmin = exportType === 'ADMIN' || exportType === 'BULK_USER_DATA';
      return (
        <Badge variant={isAdmin ? 'destructive' : 'default'} className="font-inter text-sm">
          {displayType}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'format',
    header: 'Format',
    cell: ({ row }) => {
      const format = row.original.format?.toUpperCase() || 'UNKNOWN';
      return (
        <Badge variant="outline" className="font-inter text-sm">
          {format}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'requestReference',
    header: 'Request Reference',
    cell: ({ row }) => (
      <div className="font-inter text-sm text-charcoal">
        {row.original.requestReference || <span className="text-muted-foreground italic">N/A</span>}
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
    accessorKey: 'isEncrypted',
    header: 'Encrypted',
    cell: ({ row }) => {
      // Support both isEncrypted (new) and encrypted (legacy)
      const isEncrypted = row.original.isEncrypted ?? row.original.encrypted ?? false;
      return (
        <div className="flex items-center gap-2">
          {isEncrypted ? (
            <>
              <Lock className="h-4 w-4 text-amber-600" />
              <Badge variant="secondary" className="font-inter text-xs">
                Yes
              </Badge>
            </>
          ) : (
            <>
              <Unlock className="h-4 w-4 text-gray-400" />
              <Badge variant="outline" className="font-inter text-xs">
                No
              </Badge>
            </>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'fileSize',
    header: 'File Size',
    cell: ({ row }) => (
      <div className="font-inter text-sm text-muted-foreground">
        {formatFileSize(row.original.fileSize || 0)}
      </div>
    ),
  },
];
