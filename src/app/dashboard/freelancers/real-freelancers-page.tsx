'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Clock, MapPin, Star, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { DataTable } from '@/components/common/DataTable/data-table';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EnhancedStatCard } from '@/components/ui/enhanced-stat-card';
import { VerificationBadge } from '@/components/ui/verification-badge';
import { useFreelancers } from '@/hooks/useFreelancers';
import freelancerService, { FreelancerStatsDto } from '@/services/freelancerService';
import { Freelancer } from '@/types/types';

// Column definitions for freelancers table
const freelancerColumns: ColumnDef<Freelancer>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:bg-transparent p-0 font-medium text-sm sm:text-base text-black"
        >
          Freelancer
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-inter font-medium text-charcoal">
          {row.original.cardInfo?.initials || row.original.name.charAt(0)}
        </div>
        <div>
          <div className="font-inter font-medium text-charcoal">{row.original.name}</div>
          <div className="font-inter text-xs text-muted-foreground">{row.original.email}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'mainJobTitle.name',
    header: 'Specialization',
    cell: ({ row }) => (
      <div>
        <div className="font-inter font-medium text-charcoal">
          {row.original.mainJobTitle?.name || 'N/A'}
        </div>
        <div className="font-inter text-xs text-muted-foreground">
          {row.original.mainJobTitle?.description || ''}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'cardInfo.averageRating',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:bg-transparent p-0 font-medium text-sm sm:text-base text-black"
        >
          Rating
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const rating = row.original.cardInfo?.averageRating || 0;
      return (
        <div className="flex items-center gap-1">
          <div className="flex">
            {Array(5)
              .fill(0)
              .map((_, index) => (
                <Star
                  key={index}
                  className={`h-4 w-4 ${
                    index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
          </div>
          <span className="text-sm text-gray-500">({rating})</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'city',
    header: 'Location',
    cell: ({ row }) => (
      <div className="flex items-center gap-1 font-inter text-sm text-foreground">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <span>{row.original.city || 'N/A'}</span>
      </div>
    ),
  },
  {
    accessorKey: 'slotSummary.availableSlots',
    header: 'Available Slots',
    cell: ({ row }) => {
      const availableSlots = row.original.slotSummary?.availableSlots ?? null;
      const totalSlots = row.original.slotSummary?.totalSlots ?? null;

      return (
        <div className="flex items-center gap-1 font-inter text-sm text-foreground">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>
            {availableSlots !== null && totalSlots !== null
              ? `${availableSlots} of ${totalSlots}`
              : 'N/A'}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'cardInfo.patientStories',
    header: 'Patients',
    cell: ({ row }) => (
      <div className="font-inter text-sm text-foreground text-center">
        {row.original.cardInfo?.patientStories !== undefined
          ? row.original.cardInfo.patientStories
          : 'N/A'}
      </div>
    ),
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.original.isActive;

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
      const verificationStatus = status || 'UNVERIFIED';

      return <VerificationBadge status={verificationStatus} size="sm" />;
    },
  },
];

const RealFreelancersPage = () => {
  // State for pagination and search
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [freelancerStats, setFreelancerStats] = useState<FreelancerStatsDto | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

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
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const stats = await freelancerService.getStats();
        setFreelancerStats(stats);
      } catch (err) {
        toast.error(
          `Failed to load freelancer stats: ${err instanceof Error ? err.message : 'Unknown error'}`,
        );
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Fetch freelancers with pagination and search
  const { freelancers, loading, initialLoading, error, pagination } = useFreelancers({
    page,
    limit: pageSize,
    name: debouncedSearch || undefined,
  });

  // Show error as toast when it occurs
  useEffect(() => {
    if (error) {
      toast.error(`Failed to load freelancers: ${error}`);
    }
  }, [error]);

  const stats = freelancerStats
    ? [
        {
          title: 'Total Freelancers',
          value: freelancerStats.totalFreelancers.value.toString(),
          trend: {
            value: Math.abs(freelancerStats.totalFreelancers.percentageChange),
            isUp: freelancerStats.totalFreelancers.percentageChange >= 0,
            label: freelancerStats.totalFreelancers.comparisonPeriod,
          },
          icon: Users,
          iconColor: 'text-info',
          iconBg: 'bg-info/10',
        },
        {
          title: 'Active Freelancers',
          value: freelancerStats.activeFreelancers.value.toString(),
          trend: { value: 0, isUp: true, label: 'currently' },
          icon: Clock,
          iconColor: 'text-success',
          iconBg: 'bg-success/10',
        },
      ]
    : [
        {
          title: 'Total Freelancers',
          value: '0',
          trend: undefined,
          icon: Users,
          iconColor: 'text-info',
          iconBg: 'bg-info/10',
        },
        {
          title: 'Active Freelancers',
          value: '0',
          trend: undefined,
          icon: Clock,
          iconColor: 'text-success',
          iconBg: 'bg-success/10',
        },
      ];

  return (
    <DashboardPageWrapper
      header={<h2 className="font-poppins font-bold text-2xl text-charcoal">Freelancers</h2>}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <EnhancedStatCard
              key={index}
              title={stat.title}
              value={stat.value}
              trend={stat.trend}
              icon={Icon}
              iconColor={stat.iconColor}
              iconBg={stat.iconBg}
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
        data={freelancers}
        title="All Freelancers"
        searchKey="name"
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
    </DashboardPageWrapper>
  );
};

export default RealFreelancersPage;
