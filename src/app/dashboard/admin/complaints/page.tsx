'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Eye, Shield } from 'lucide-react';
import { AlertTriangle, CheckCircle, FileText, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { DataTable } from '@/components/common/DataTable/data-table';
import { StatusBadge } from '@/components/core/Dashboard/AdminSide/Components/StatusBadge';
import {
  StatusFilter,
  StatusFilterOption,
} from '@/components/core/Dashboard/AdminSide/Components/StatusFilter';
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      if (searchQuery !== debouncedSearch) {
        setPage(1);
      }
    }, 500);

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
  const [statsLoading, setStatsLoading] = useState(false);
  const [initialStatsLoading, setInitialStatsLoading] = useState(true);

  // Fetch stats separately
  useEffect(() => {
    const fetchStats = async () => {
      const hasStats = stats.total > 0 || stats.pending > 0 || stats.resolved > 0;
      try {
        if (!hasStats) {
          setInitialStatsLoading(true);
        } else {
          setStatsLoading(true);
        }
        const response = await adminComplaintService.getStatistics();

        if (response.success) {
          const { total, pending, underReview, resolved, dismissed } = response.data;
          setStats({
            total,
            pending,
            underReview,
            resolved,
            dismissed,
          });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setStatsLoading(false);
        setInitialStatsLoading(false);
      }
    };

    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Define stat cards configuration
  const statCards = [
    {
      title: 'Total Complaints',
      value: stats.total.toString(),
      icon: FileText,
      iconColor: 'text-primary',
      iconBg: 'bg-primary/10',
    },
    {
      title: 'Pending',
      value: stats.pending.toString(),
      icon: AlertTriangle,
      iconColor: 'text-warning',
      iconBg: 'bg-warning/10',
    },
    {
      title: 'Under Review',
      value: stats.underReview.toString(),
      icon: Shield,
      iconColor: 'text-info',
      iconBg: 'bg-info/10',
    },
    {
      title: 'Resolved',
      value: stats.resolved.toString(),
      icon: CheckCircle,
      iconColor: 'text-success',
      iconBg: 'bg-success/10',
    },
    {
      title: 'Dismissed',
      value: stats.dismissed.toString(),
      icon: XCircle,
      iconColor: 'text-error',
      iconBg: 'bg-error/10',
    },
  ];

  // Status filter options
  const statusFilterOptions: StatusFilterOption<ComplaintStatus | undefined>[] = [
    {
      label: 'All',
      value: undefined,
      color: 'primary',
    },
    {
      label: 'Pending',
      value: 'PENDING' as ComplaintStatus,
      color: 'warning',
    },
    {
      label: 'Under Review',
      value: 'UNDER_REVIEW' as ComplaintStatus,
      color: 'info',
    },
    {
      label: 'Resolved',
      value: 'RESOLVED' as ComplaintStatus,
      color: 'success',
    },
    {
      label: 'Dismissed',
      value: 'DISMISSED' as ComplaintStatus,
      color: 'error',
    },
  ];

  // Render stat cards with responsive layout
  const renderStatCards = () => (
    <div
      className="grid gap-6 
      grid-cols-1 
      sm:grid-cols-2 
      lg:grid-cols-3 
      xl:grid-cols-5"
    >
      {statCards.map((card, index) => (
        <div
          key={card.title}
          className={`
            ${index >= 3 ? 'lg:col-span-1 xl:col-span-1' : ''}
          `}
        >
          <EnhancedStatCard
            title={card.title}
            value={card.value}
            icon={card.icon}
            iconColor={card.iconColor}
            iconBg={card.iconBg}
            loading={
              initialStatsLoading || (statsLoading && stats.total === 0 && stats.pending === 0)
            }
          />
        </div>
      ))}
    </div>
  );

  return (
    <DashboardPageWrapper
      header={<h1 className="font-poppins font-bold text-2xl text-charcoal">Complaints Center</h1>}
    >
      <div className="space-y-6 lg:space-y-8">
        {/* Stats Cards */}
        {renderStatCards()}

        {/* Status Filter */}
        <StatusFilter<ComplaintStatus | undefined>
          options={statusFilterOptions}
          selectedValue={statusFilter}
          onChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
        />

        {/* Complaints Table */}
        <DataTable
          columns={columns}
          data={complaints}
          title={`${statusFilter || 'All'} Complaints`}
          searchKey="reason"
          searchPlaceholder="Search by name..."
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
      </div>
    </DashboardPageWrapper>
  );
};

export default ComplaintsPage;
