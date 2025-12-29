'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Edit, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { DataTable } from '@/components/common/DataTable/data-table';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EnhancedStatCard } from '@/components/ui/enhanced-stat-card';
import { VerificationBadge } from '@/components/ui/verification-badge';
import { useFreelancers, useFreelancerStats } from '@/hooks/queries/useFreelancers';
import { Freelancer } from '@/types/types';

const RealFreelancersPage = () => {
  const router = useRouter();
  // State for pagination and search
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search query
  useEffect(() => {
    // 500ms debounce delay
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      // Reset to page 1 when search changes
      if (searchQuery !== debouncedSearch) {
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, debouncedSearch]);

  // Fetch freelancer stats
  const {
    data: freelancerStats,
    isLoading: statsLoading,
    error: statsError,
  } = useFreelancerStats();

  // Fetch freelancers with pagination and search
  const {
    data: freelancersData,
    isLoading,
    isFetching,
    error,
  } = useFreelancers({
    page,
    limit: pageSize,
    name: debouncedSearch || undefined,
  });

  const freelancers = freelancersData?.freelancers || [];
  const pagination = freelancersData?.pagination;

  // Show error toast only when no cached data exists
  useEffect(() => {
    if (statsError && !freelancerStats) {
      const errorMessage =
        statsError instanceof Error ? statsError.message : 'Failed to load freelancer stats';
      toast.error(errorMessage);
    }
  }, [statsError, freelancerStats]);

  useEffect(() => {
    if (error && !freelancersData) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load freelancers';
      toast.error(errorMessage);
    }
  }, [error, freelancersData]);

  const handleViewProfile = (freelancerId: string) => {
    router.push(`/dashboard/freelancer/${freelancerId}`);
  };

  const handleEdit = (_freelancerId: string) => {
    // TODO: Implement edit functionality - could navigate to edit page or open dialog
    toast.info('Edit functionality coming soon');
  };

  // Column definitions for freelancers table
  const freelancerColumns: ColumnDef<Freelancer>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => (
        <div className="font-mono text-xs text-muted-foreground">{row.original.id ?? 'N/A'}</div>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="font-inter font-medium text-charcoal">{row.original.name ?? 'N/A'}</div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <div className="font-inter text-sm text-muted-foreground">
          {row.original.email ?? 'N/A'}
        </div>
      ),
    },
    {
      accessorKey: 'mainJobTitle.name',
      header: 'Specialization',
      cell: ({ row }) => (
        <div className="font-inter text-sm text-charcoal">
          {row.original.mainJobTitle?.name ?? 'N/A'}
        </div>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => {
        const { isActive } = row.original;
        return (
          <Badge
            variant="outline"
            className={`font-inter font-medium text-xs px-2 py-1 ${
              isActive
                ? 'bg-success/10 text-success border-success/20'
                : 'bg-error/10 text-error border-error/20'
            }`}
          >
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'verificationStatus',
      header: 'Verification',
      cell: ({ row }) => {
        const status = row.original.verificationStatus;
        const verificationStatus = status ?? 'UNVERIFIED';
        return <VerificationBadge status={verificationStatus} size="sm" />;
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const freelancer = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewProfile(freelancer.id)}
              className="h-8 w-8 p-0 hover:bg-info/10"
              title="View Profile"
            >
              <Eye className="h-4 w-4 text-info" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(freelancer.id)}
              className="h-8 w-8 p-0 hover:bg-info/10"
              title="Edit"
            >
              <Edit className="h-4 w-4 text-info" />
            </Button>
          </div>
        );
      },
    },
  ];

  const stats =
    freelancerStats?.totalFreelancers?.value && freelancerStats.activeFreelancers?.value
      ? [
          {
            title: 'Total Freelancers',
            value: freelancerStats.totalFreelancers.value?.toString() || '0',
            trend: {
              value: Math.abs(freelancerStats.totalFreelancers.percentageChange || 0),
              isUp: (freelancerStats.totalFreelancers.percentageChange || 0) >= 0,
              label: freelancerStats.totalFreelancers.comparisonPeriod || 'all time',
            },
          },
          {
            title: 'Active Freelancers',
            value: freelancerStats.activeFreelancers.value?.toString() || '0',
            trend: { value: 0, isUp: true, label: 'currently' },
          },
        ]
      : [
          {
            title: 'Total Freelancers',
            value: '0',
            trend: undefined,
          },
          {
            title: 'Active Freelancers',
            value: '0',
            trend: undefined,
          },
        ];

  return (
    <DashboardPageWrapper
      header={<h2 className="font-poppins font-bold text-2xl text-charcoal">Freelancers</h2>}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {stats.map((stat) => {
          return (
            <EnhancedStatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              trend={stat.trend}
              interactive
              loading={statsLoading}
              onClick={() => {
                // Navigate to details or show modal
              }}
            />
          );
        })}
      </div>

      {/* Freelancers Table with built-in pagination */}
      <DataTable
        columns={freelancerColumns}
        data={freelancers as unknown as Freelancer[]}
        title="All Freelancers"
        searchKey="name"
        searchPlaceholder="Search by name or email..."
        enableSorting={false}
        enableFiltering={true}
        enableColumnVisibility={true}
        enablePagination={true}
        showSearch={true}
        showSorting={false}
        initialLoading={isLoading && !freelancers.length}
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
      />
    </DashboardPageWrapper>
  );
};

export default RealFreelancersPage;
