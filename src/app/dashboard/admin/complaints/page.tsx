'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { DataTable } from '@/components/common/DataTable/data-table';
import { StatusBadge } from '@/components/core/Dashboard/AdminSide/Components/StatusBadge';
import { StatusFilterOption } from '@/components/core/Dashboard/AdminSide/Components/StatusFilter';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Button } from '@/components/ui/button';
import { EnhancedStatCard } from '@/components/ui/enhanced-stat-card';
import { useAdminComplaints, useAdminComplaintStats } from '@/hooks/queries/useComplaints';
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
  const {
    data: complaintsData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useAdminComplaints({
    page,
    limit: pageSize,
    name: debouncedSearch || undefined,
    status: statusFilter,
  });

  const complaints = complaintsData?.complaints || [];
  const pagination = complaintsData?.pagination;

  // Fetch stats
  const { data: statsData, isLoading: statsLoading, error: statsError } = useAdminComplaintStats();

  const stats: ComplaintStats = statsData?.data
    ? {
        total: statsData.data.total || 0,
        pending: statsData.data.pending || 0,
        underReview: statsData.data.underReview || 0,
        resolved: statsData.data.resolved || 0,
        dismissed: statsData.data.dismissed || 0,
      }
    : {
        total: 0,
        pending: 0,
        underReview: 0,
        resolved: 0,
        dismissed: 0,
      };

  // Show errors as toast when they occur
  useEffect(() => {
    if (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load complaints';
      toast.error(errorMessage);
    }
  }, [error]);

  useEffect(() => {
    if (statsError) {
      const errorMessage =
        statsError instanceof Error ? statsError.message : 'Failed to load complaint stats';
      toast.error(errorMessage);
    }
  }, [statsError]);

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
    },
    {
      title: 'Pending',
      value: stats.pending.toString(),
    },
    {
      title: 'Under Review',
      value: stats.underReview.toString(),
    },
    {
      title: 'Resolved',
      value: stats.resolved.toString(),
    },
    {
      title: 'Dismissed',
      value: stats.dismissed.toString(),
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card) => (
        <EnhancedStatCard
          key={card.title}
          title={card.title}
          value={card.value}
          loading={statsLoading && !statsData}
        />
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

        {/* Complaints Table */}
        <DataTable
          columns={columns}
          data={complaints}
          title="All Complaints"
          searchKey="reason"
          searchPlaceholder="Search by name..."
          enableSorting={false}
          enableFiltering={true}
          enableColumnVisibility={true}
          enablePagination={true}
          showSearch={true}
          showSorting={false}
          initialLoading={isLoading && !complaints.length}
          loading={isFetching}
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
          filterOptions={statusFilterOptions.map((opt) => ({
            label: opt.label,
            value: opt.value ?? 'all',
            color: opt.color,
          }))}
          selectedFilter={statusFilter ?? 'all'}
          onFilterChange={(value) => {
            setStatusFilter(value === 'all' ? undefined : (value as ComplaintStatus));
            setPage(1);
          }}
        />
      </div>
    </DashboardPageWrapper>
  );
};

export default ComplaintsPage;
