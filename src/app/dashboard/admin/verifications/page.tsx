'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CheckCircle, Clock, ExternalLink, FileText, Shield, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { DataTable } from '@/components/common/DataTable/data-table';
import { StatusBadge } from '@/components/core/Dashboard/AdminSide/Components/StatusBadge';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { EnhancedStatCard } from '@/components/ui/enhanced-stat-card';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useVerifications } from '@/hooks/useVerifications';
import adminVerificationService, {
  type PendingVerificationResponse,
} from '@/services/adminVerificationService';

interface VerificationStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

const statsConfig = [
  {
    key: 'total' as keyof VerificationStats,
    title: 'Total Verifications',
    icon: Shield,
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
  },
  {
    key: 'pending' as keyof VerificationStats,
    title: 'Pending',
    icon: Clock,
    iconColor: 'text-warning',
    iconBg: 'bg-warning/10',
  },
  {
    key: 'approved' as keyof VerificationStats,
    title: 'Approved',
    icon: CheckCircle,
    iconColor: 'text-success',
    iconBg: 'bg-success/10',
  },
  {
    key: 'rejected' as keyof VerificationStats,
    title: 'Rejected',
    icon: XCircle,
    iconColor: 'text-error',
    iconBg: 'bg-error/10',
  },
];

const VerificationsPage = () => {
  // State for pagination and search
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | undefined>(
    undefined,
  );

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      // Reset to page 1 when search changes
      if (searchQuery !== debouncedSearch) {
        setPage(1);
      }
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timer);
  }, [searchQuery, debouncedSearch]);

  // Fetch verifications with pagination, search, and status filter
  const { verifications, loading, initialLoading, error, pagination } = useVerifications({
    page,
    limit: pageSize,
    name: debouncedSearch || undefined,
    status: statusFilter,
  });

  // Calculate stats - we'll need to fetch these separately or from the API
  const [stats, setStats] = useState<VerificationStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch stats separately
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const [pendingResponse, approvedResponse, rejectedResponse] = await Promise.all([
          adminVerificationService.getByStatus('PENDING'),
          adminVerificationService.getByStatus('APPROVED'),
          adminVerificationService.getByStatus('REJECTED'),
        ]);

        const pending = pendingResponse.success ? (pendingResponse.data || []).length : 0;
        const approved = approvedResponse.success ? (approvedResponse.data || []).length : 0;
        const rejected = rejectedResponse.success ? (rejectedResponse.data || []).length : 0;

        setStats({
          pending,
          approved,
          rejected,
          total: pending + approved + rejected,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const columns: ColumnDef<PendingVerificationResponse>[] = [
    {
      accessorKey: 'name',
      header: 'Freelancer',
      cell: ({ row }) => (
        <div>
          <div className="font-inter font-medium text-foreground">{row.original.name}</div>
          <div className="font-open-sans text-xs text-muted-foreground">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: 'verificationStatus',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.verificationStatus} size="sm" />,
    },
    {
      id: 'firstAidCertificate',
      header: 'First Aid Certificate',
      cell: ({ row }) => {
        const certificateUrl = row.original.firstAidCertificateUrl;
        if (!certificateUrl) {
          return <span className="font-open-sans text-sm text-muted-foreground">Not uploaded</span>;
        }
        return (
          <a
            href={certificateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-inter text-sm text-primary hover:underline flex items-center gap-1"
          >
            <FileText className="h-4 w-4" />
            View Certificate
            <ExternalLink className="h-3 w-3" />
          </a>
        );
      },
    },
    {
      id: 'verificationDocuments',
      header: 'Verification Documents',
      cell: ({ row }) => {
        const documents = row.original.verificationDocuments || [];
        if (documents.length === 0) {
          return <span className="font-open-sans text-sm text-muted-foreground">No documents</span>;
        }
        return (
          <div className="flex flex-col gap-1">
            {documents.map((url, index) => (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-inter text-sm text-primary hover:underline flex items-center gap-1"
              >
                <FileText className="h-3 w-3" />
                doc_{index + 1}
                <ExternalLink className="h-3 w-3" />
              </a>
            ))}
          </div>
        );
      },
    },
  ];

  if (error) {
    return (
      <DashboardPageWrapper
        header={
          <h1 className="font-poppins font-bold text-2xl text-charcoal">Verification Queue</h1>
        }
      >
        <div className="flex items-center justify-center h-64">
          <div className="font-open-sans text-lg text-error">Error: {error}</div>
        </div>
      </DashboardPageWrapper>
    );
  }

  return (
    <DashboardPageWrapper
      header={<h1 className="font-poppins font-bold text-2xl text-charcoal">Verification Queue</h1>}
    >
      <div className="space-y-6 lg:space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {statsConfig.map((config) => (
            <EnhancedStatCard
              key={config.key}
              title={config.title}
              value={stats[config.key].toString()}
              icon={config.icon}
              iconColor={config.iconColor}
              iconBg={config.iconBg}
              sparklineData={Array.from({ length: 7 }, () => stats[config.key])}
              loading={statsLoading}
            />
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              setStatusFilter('PENDING');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-md font-medium ${
              statusFilter === 'PENDING'
                ? 'bg-warning text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending ({stats.pending})
          </button>
          <button
            onClick={() => {
              setStatusFilter('APPROVED');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-md font-medium ${
              statusFilter === 'APPROVED'
                ? 'bg-success text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Approved ({stats.approved})
          </button>
          <button
            onClick={() => {
              setStatusFilter('REJECTED');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-md font-medium ${
              statusFilter === 'REJECTED'
                ? 'bg-error text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Rejected ({stats.rejected})
          </button>
          <button
            onClick={() => {
              setStatusFilter(undefined);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-md font-medium ${
              statusFilter === undefined
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({stats.total})
          </button>
        </div>

        {/* Verifications Table */}
        <DataTable
          columns={columns}
          data={verifications}
          title={`${statusFilter || 'All'} Verifications`}
          searchKey="name"
          searchPlaceholder="Search verifications..."
          enableSorting={false}
          enableFiltering={true}
          enableColumnVisibility={true}
          enablePagination={true}
          showSearch={true}
          showSorting={false}
          initialLoading={initialLoading}
          loading={loading}
          externalSearchValue={searchQuery}
          onExternalSearchChange={(value) => setSearchQuery(value)}
          externalPageIndex={page - 1}
          externalPageSize={pageSize}
          totalPages={pagination?.totalPages}
          onExternalPageChange={(pageIndex) => setPage(pageIndex + 1)}
          onExternalPageSizeChange={(newPageSize) => {
            setPageSize(newPageSize);
            setPage(1);
          }}
        />

        {/* Summary */}
        <div className="mt-4 text-sm text-gray-500">
          Showing {verifications.length} of {pagination?.total || 0} verifications
          {debouncedSearch && ` (filtered by "${debouncedSearch}")`}
          {statusFilter && ` with status "${statusFilter}"`}
        </div>
      </div>
    </DashboardPageWrapper>
  );
};

export default VerificationsPage;
