'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';

import { DataTable } from '@/components/common/DataTable/data-table';
import { StatusBadge } from '@/components/core/Dashboard/AdminSide/Components/StatusBadge';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EnhancedStatCard } from '@/components/ui/enhanced-stat-card';
import { StatsCardsSkeleton } from '@/components/ui/skeletons/StatsCardsSkeleton';
import { useAdminVerifications, useAdminVerificationStats } from '@/hooks/queries/useAdmin';
import type { PendingVerificationResponse } from '@/services/adminVerificationService';

interface VerificationStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

const statsConfig = [
  { key: 'total' as keyof VerificationStats, title: 'Total Verifications' },
  { key: 'pending' as keyof VerificationStats, title: 'Pending' },
  { key: 'approved' as keyof VerificationStats, title: 'Approved' },
  { key: 'rejected' as keyof VerificationStats, title: 'Rejected' },
];

const VerificationsPage = () => {
  const {
    data: verificationsData,
    isLoading,
    isFetching,
    error,
  } = useAdminVerifications({ page: 1, limit: 100 });

  const allVerifications = verificationsData?.verifications || [];

  // Only keep freelancers who have uploaded at least one verification file
  const verificationItems = useMemo(() => {
    return allVerifications.filter((item) => {
      const freelancerFiles = item.freelancerFiles || [];
      const hasVerificationFiles = freelancerFiles.some((file) => file.category === 'VERIFICATION');
      const hasLegacyDocs = item.verificationDocuments && item.verificationDocuments.length > 0;
      return hasVerificationFiles || hasLegacyDocs;
    });
  }, [allVerifications]);

  // Stats
  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
  } = useAdminVerificationStats();

  const stats: VerificationStats = statsData?.data
    ? {
        total: statsData.data.total || 0,
        pending: statsData.data.pending || 0,
        approved: statsData.data.approved || 0,
        rejected: statsData.data.rejected || 0,
      }
    : { pending: 0, approved: 0, rejected: 0, total: 0 };

  useEffect(() => {
    if (error && !verificationsData) {
      toast.error(error instanceof Error ? error.message : 'Failed to load verifications');
    }
  }, [error, verificationsData]);

  useEffect(() => {
    if (statsError && !statsData) {
      toast.error(
        statsError instanceof Error ? statsError.message : 'Failed to load verification stats',
      );
    }
  }, [statsError, statsData]);

  // ── Table columns ──
  const columns: ColumnDef<PendingVerificationResponse>[] = [
    {
      accessorKey: 'name',
      header: 'Freelancer',
      cell: ({ row }) => (
        <div>
          <div className="font-inter font-medium text-charcoal">{row.original.name}</div>
          <div className="font-inter text-xs text-muted-foreground">{row.original.email}</div>
        </div>
      ),
    },
    {
      id: 'role',
      header: 'Role',
      cell: ({ row }) => {
        const jt = (row.original as any).mainJobTitle;
        return jt ? (
          <Badge variant="secondary" className="text-xs">
            {jt.name}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">–</span>
        );
      },
    },
    {
      id: 'documents',
      header: 'Documents',
      cell: ({ row }) => {
        const files = row.original.freelancerFiles || [];
        const verificationFiles = files.filter((f) => f.category === 'VERIFICATION');
        const count = verificationFiles.length;
        return (
          <span className="text-sm tabular-nums">
            {count} file{count !== 1 ? 's' : ''} uploaded
          </span>
        );
      },
    },
    {
      id: 'expiry',
      header: 'Expiry',
      cell: ({ row }) => {
        const files = row.original.freelancerFiles || [];
        const now = new Date();
        const sixMonths = new Date(now);
        sixMonths.setMonth(now.getMonth() + 6);

        const expiredCount = files.filter(
          (f) => f.expiryDate && new Date(f.expiryDate) < now,
        ).length;
        const expiringSoonCount = files.filter(
          (f) =>
            f.expiryDate && new Date(f.expiryDate) >= now && new Date(f.expiryDate) <= sixMonths,
        ).length;

        if (expiredCount > 0) {
          return (
            <Badge variant="outline" className="text-[10px] bg-red-50 text-red-700 border-red-200">
              {expiredCount} expired
            </Badge>
          );
        }
        if (expiringSoonCount > 0) {
          return (
            <Badge
              variant="outline"
              className="text-[10px] bg-amber-50 text-amber-700 border-amber-200"
            >
              {expiringSoonCount} expiring
            </Badge>
          );
        }
        return <span className="text-xs text-muted-foreground">–</span>;
      },
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.verificationStatus || 'PENDING';
        return <StatusBadge status={status} size="sm" />;
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const freelancerId = row.original.id || row.original.freelancerId || '';
        return (
          <Button
            size="sm"
            variant="default"
            className="gap-1.5"
            onClick={() => {
              window.location.href = `/dashboard/admin/verifications/${freelancerId}`;
            }}
          >
            <Eye className="h-3.5 w-3.5" />
            Review
          </Button>
        );
      },
    },
  ];

  return (
    <DashboardPageWrapper
      header={<h1 className="font-poppins font-bold text-2xl text-charcoal">Verification Queue</h1>}
    >
      <div className="space-y-6 lg:space-y-8">
        {/* Stats Cards */}
        {statsLoading && !statsData ? (
          <StatsCardsSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {statsConfig.map((config) => (
              <EnhancedStatCard
                key={config.key}
                title={config.title}
                value={stats[config.key].toString()}
              />
            ))}
          </div>
        )}

        {/* Verification Queue Table */}
        <DataTable
          columns={columns}
          data={verificationItems}
          title="Verification Documents"
          searchKey="name"
          searchPlaceholder="Search by freelancer name..."
          enableSorting={false}
          enableFiltering={true}
          enableColumnVisibility={true}
          enablePagination={true}
          showSearch={true}
          showSorting={false}
          initialLoading={isLoading && !verificationItems.length}
          loading={isFetching}
          pageSize={10}
        />
      </div>
    </DashboardPageWrapper>
  );
};

export default VerificationsPage;
