'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Eye, Shield } from 'lucide-react';
import { AlertTriangle, CheckCircle, FileText, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { DataTable } from '@/components/common/DataTable/data-table';
import { StatusBadge } from '@/components/core/Dashboard/AdminSide/Components/StatusBadge';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Button } from '@/components/ui/button';
import { EnhancedStatCard } from '@/components/ui/enhanced-stat-card';
import { useComplaints } from '@/hooks/useComplaints';
import adminComplaintService from '@/services/adminComplaintService';
import { ComplaintStatus } from '@/types/types';

interface ComplaintStats {
  total: number;
  pending: number;
  underReview: number;
  resolved: number;
  dismissed: number;
}

interface Complaint {
  id: string;
  reporter: {
    id: string;
    name: string;
    email: string;
  };
  reportedUser: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  category: string;
  reason: string;
  description: string;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
}

const ComplaintsPage = () => {
  const router = useRouter();
  // State for pagination and search
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | undefined>(undefined);

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

  // Fetch complaints with pagination, search, and status filter
  const { complaints, loading, initialLoading, error, pagination, refetch } = useComplaints({
    page,
    limit: pageSize,
    name: debouncedSearch || undefined,
    status: statusFilter,
  });

  // Calculate stats - we'll need to fetch these separately or from the API
  const [stats, setStats] = useState<ComplaintStats>({
    total: 0,
    pending: 0,
    underReview: 0,
    resolved: 0,
    dismissed: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch stats separately
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const [pendingResponse, underReviewResponse, resolvedResponse, dismissedResponse] =
          await Promise.all([
            adminComplaintService.getAll(undefined, { status: 'PENDING' }),
            adminComplaintService.getAll(undefined, { status: 'UNDER_REVIEW' }),
            adminComplaintService.getAll(undefined, { status: 'RESOLVED' }),
            adminComplaintService.getAll(undefined, { status: 'DISMISSED' }),
          ]);

        const pending = pendingResponse.success ? (pendingResponse.data || []).length : 0;
        const underReview = underReviewResponse.success
          ? (underReviewResponse.data || []).length
          : 0;
        const resolved = resolvedResponse.success ? (resolvedResponse.data || []).length : 0;
        const dismissed = dismissedResponse.success ? (dismissedResponse.data || []).length : 0;

        setStats({
          pending,
          underReview,
          resolved,
          dismissed,
          total: pending + underReview + resolved + dismissed,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Show error as toast when it occurs
  useEffect(() => {
    if (error) {
      toast.error(`Failed to load complaints: ${error}`);
    }
  }, [error]);

  const handleViewDetails = (complaintId: string) => {
    router.push(`/dashboard/admin/complaints/${complaintId}`);
  };

  const columns: ColumnDef<Complaint>[] = [
    {
      accessorKey: 'reporter',
      header: 'Reporter',
      cell: ({ row }) => (
        <div>
          <div className="font-inter font-medium text-sm text-charcoal">
            {row.original.reporter.name}
          </div>
          <div className="font-inter text-xs text-muted-foreground">
            {row.original.reporter.email}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'reportedUser',
      header: 'Reported User',
      cell: ({ row }) => (
        <div>
          <div className="font-inter font-medium text-sm text-charcoal">
            {row.original.reportedUser.name}
          </div>
          <div className="font-inter text-xs text-muted-foreground">
            {row.original.reportedUser.email}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <div className="font-inter text-sm text-foreground capitalize">
          {row.original.category.replace(/_/g, ' ').toLowerCase()}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} size="sm" />,
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => (
        <div className="font-inter text-xs text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewDetails(row.original.id)}
          className="h-8 px-3 hover:bg-info/10 text-info font-inter"
        >
          <Eye className="h-4 w-4 mr-2" />
          View
        </Button>
      ),
    },
  ];

  return (
    <DashboardPageWrapper
      header={<h1 className="font-poppins font-bold text-2xl text-charcoal">Complaints Center</h1>}
    >
      <div className="space-y-6 lg:space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <EnhancedStatCard
            title="Total Complaints"
            value={stats.total.toString()}
            icon={FileText}
            iconColor="text-primary"
            iconBg="bg-primary/10"
            loading={statsLoading}
          />
          <EnhancedStatCard
            title="Pending"
            value={stats.pending.toString()}
            icon={AlertTriangle}
            iconColor="text-warning"
            iconBg="bg-warning/10"
            loading={statsLoading}
          />
          <EnhancedStatCard
            title="Under Review"
            value={stats.underReview.toString()}
            icon={Shield}
            iconColor="text-info"
            iconBg="bg-info/10"
            loading={statsLoading}
          />
          <EnhancedStatCard
            title="Resolved"
            value={stats.resolved.toString()}
            icon={CheckCircle}
            iconColor="text-success"
            iconBg="bg-success/10"
            loading={statsLoading}
          />
          <EnhancedStatCard
            title="Dismissed"
            value={stats.dismissed.toString()}
            icon={XCircle}
            iconColor="text-error"
            iconBg="bg-error/10"
            loading={statsLoading}
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
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
              setStatusFilter('UNDER_REVIEW');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-md font-medium ${
              statusFilter === 'UNDER_REVIEW'
                ? 'bg-info text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Under Review ({stats.underReview})
          </button>
          <button
            onClick={() => {
              setStatusFilter('RESOLVED');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-md font-medium ${
              statusFilter === 'RESOLVED'
                ? 'bg-success text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Resolved ({stats.resolved})
          </button>
          <button
            onClick={() => {
              setStatusFilter('DISMISSED');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-md font-medium ${
              statusFilter === 'DISMISSED'
                ? 'bg-error text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Dismissed ({stats.dismissed})
          </button>
        </div>

        {/* Complaints Table */}
        <DataTable
          columns={columns}
          data={complaints}
          title={`${statusFilter || 'All'} Complaints`}
          searchKey="reason"
          searchPlaceholder="Search complaints..."
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
          Showing {complaints.length} of {pagination?.total || 0} complaints
          {debouncedSearch && ` (filtered by "${debouncedSearch}")`}
          {statusFilter && ` with status "${statusFilter}"`}
        </div>
      </div>
    </DashboardPageWrapper>
  );
};

export default ComplaintsPage;
