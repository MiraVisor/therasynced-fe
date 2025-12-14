'use client';

import { AlertCircle, CheckCircle2, Eye } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataBreach, BreachStatus, BreachRiskLevel } from '@/redux/api/dataRightsApi';

export const formatBreachDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getStatusBadgeVariant = (
  status: BreachStatus,
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case BreachStatus.DETECTED:
      return 'destructive';
    case BreachStatus.INVESTIGATING:
      return 'secondary';
    case BreachStatus.CONTAINED:
      return 'default';
    case BreachStatus.RESOLVED:
      return 'outline';
    default:
      return 'outline';
  }
};

export const getRiskLevelBadgeVariant = (
  riskLevel: BreachRiskLevel,
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (riskLevel) {
    case BreachRiskLevel.LOW:
      return 'outline';
    case BreachRiskLevel.MEDIUM:
      return 'default';
    case BreachRiskLevel.HIGH:
      return 'secondary';
    case BreachRiskLevel.CRITICAL:
      return 'destructive';
    default:
      return 'outline';
  }
};

export const getStatusLabel = (status: BreachStatus): string => {
  switch (status) {
    case BreachStatus.DETECTED:
      return 'Detected';
    case BreachStatus.INVESTIGATING:
      return 'Investigating';
    case BreachStatus.CONTAINED:
      return 'Contained';
    case BreachStatus.RESOLVED:
      return 'Resolved';
    default:
      return status;
  }
};

export const getRiskLevelLabel = (riskLevel: BreachRiskLevel): string => {
  switch (riskLevel) {
    case BreachRiskLevel.LOW:
      return 'Low';
    case BreachRiskLevel.MEDIUM:
      return 'Medium';
    case BreachRiskLevel.HIGH:
      return 'High';
    case BreachRiskLevel.CRITICAL:
      return 'Critical';
    default:
      return riskLevel;
  }
};

export const breachColumns: ColumnDef<DataBreach>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => (
      <div className="font-inter text-sm text-charcoal font-mono">
        {row.original.id.substring(0, 8)}...
      </div>
    ),
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => (
      <div
        className="font-inter text-sm text-charcoal max-w-md truncate"
        title={row.original.description}
      >
        {row.original.description}
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge
        variant={getStatusBadgeVariant(row.original.status)}
        className="font-inter text-sm"
      >
        {getStatusLabel(row.original.status)}
      </Badge>
    ),
  },
  {
    accessorKey: 'riskLevel',
    header: 'Risk Level',
    cell: ({ row }) => (
      <Badge
        variant={getRiskLevelBadgeVariant(row.original.riskLevel)}
        className="font-inter text-sm"
      >
        {getRiskLevelLabel(row.original.riskLevel)}
      </Badge>
    ),
  },
  {
    accessorKey: 'affectedUsers',
    header: 'Affected Users',
    cell: ({ row }) => (
      <div className="font-inter text-sm text-charcoal font-medium">
        {row.original.affectedUsers.toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: 'detectedAt',
    header: 'Detected Date',
    cell: ({ row }) => (
      <div className="font-inter text-sm text-charcoal">
        {formatBreachDate(row.original.detectedAt)}
      </div>
    ),
  },
  {
    accessorKey: 'reportedToDpc',
    header: 'DPC Reported',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.reportedToDpc ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="font-inter text-sm text-green-600">Yes</span>
            {row.original.reportedAt && (
              <span className="font-inter text-xs text-muted-foreground">
                ({new Date(row.original.reportedAt).toLocaleDateString()})
              </span>
            )}
          </>
        ) : (
          <>
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="font-inter text-sm text-red-600">No</span>
          </>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'notifiedUsers',
    header: 'Users Notified',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.notifiedUsers ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="font-inter text-sm text-green-600">Yes</span>
            {row.original.notifiedAt && (
              <span className="font-inter text-xs text-muted-foreground">
                ({new Date(row.original.notifiedAt).toLocaleDateString()})
              </span>
            )}
          </>
        ) : (
          <>
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="font-inter text-sm text-red-600">No</span>
          </>
        )}
      </div>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <Link href={`/dashboard/admin/breaches/${row.original.id}`}>
        <Button variant="ghost" size="sm" className="font-inter">
          <Eye className="h-4 w-4 mr-2" />
          View
        </Button>
      </Link>
    ),
  },
];

