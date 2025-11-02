'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Clock, Heart, MapPin, Star, Users } from 'lucide-react';

import { DataTable } from '@/components/common/DataTable/data-table';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EnhancedStatCard } from '@/components/ui/enhanced-stat-card';
import { VerificationBadge } from '@/components/ui/verification-badge';
import { useFreelancers } from '@/hooks/useFreelancers';
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
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
          {row.original.cardInfo?.initials || row.original.name.charAt(0)}
        </div>
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-sm text-gray-500">{row.original.email}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'cardInfo.mainService',
    header: 'Specialization',
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.cardInfo?.mainService || 'General'}</div>
        <div className="text-sm text-gray-500">{row.original.cardInfo?.yearsOfExperience}</div>
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
      <div className="flex items-center gap-1">
        <MapPin className="h-4 w-4 text-gray-500" />
        <span>{row.original.city}</span>
      </div>
    ),
  },
  {
    accessorKey: 'slotSummary.availableSlots',
    header: 'Available Slots',
    cell: ({ row }) => {
      const availableSlots = row.original.slotSummary?.availableSlots || 0;
      const totalSlots = row.original.slotSummary?.totalSlots || 0;

      return (
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4 text-gray-500" />
          <span>
            {availableSlots} of {totalSlots}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'cardInfo.patientStories',
    header: 'Patients',
    cell: ({ row }) => (
      <div className="text-center">{row.original.cardInfo?.patientStories || 0}</div>
    ),
  },
  {
    accessorKey: 'isFavorite',
    header: 'Favorite',
    cell: ({ row }) => {
      const isFavorite = row.original.isFavorite;

      return (
        <div className="flex justify-center">
          <Heart
            className={`h-5 w-5 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-300'}`}
          />
        </div>
      );
    },
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.original.isActive;

      return (
        <Badge
          variant="outline"
          className={`px-3 py-1 rounded-md ${
            isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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
      const verificationStatus = row.original.verificationStatus || 'unverified';

      return <VerificationBadge status={verificationStatus} size="sm" />;
    },
  },
];

const RealFreelancersPage = () => {
  // Fetch all freelancers
  const { freelancers, loading, initialLoading, error } = useFreelancers();

  // Calculate stats
  const totalFreelancers = freelancers.length;
  const activeFreelancers = freelancers.filter((f) => f.isActive).length;

  const stats = [
    {
      title: 'Total Freelancers',
      value: totalFreelancers.toString(),
      trend: { value: 0, isUp: true, label: 'all time' },
      icon: Users,
      iconColor: 'text-info',
      iconBg: 'bg-info/10',
      sparklineData: Array.from(
        { length: 7 },
        () => totalFreelancers + Math.floor(Math.random() * 5),
      ),
    },
    {
      title: 'Active Freelancers',
      value: activeFreelancers.toString(),
      trend: { value: 0, isUp: true, label: 'currently' },
      icon: Clock,
      iconColor: 'text-success',
      iconBg: 'bg-success/10',
      sparklineData: Array.from(
        { length: 7 },
        () => activeFreelancers + Math.floor(Math.random() * 3),
      ),
    },
  ];

  if (error) {
    return (
      <DashboardPageWrapper
        header={<h2 className="font-poppins font-bold text-2xl text-charcoal">Freelancers</h2>}
      >
        <div className="flex items-center justify-center h-64">
          <div className="font-open-sans text-lg text-error">Error: {error}</div>
        </div>
      </DashboardPageWrapper>
    );
  }

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
              sparklineData={stat.sparklineData}
              interactive
              onClick={() => {
                // Navigate to details or show modal
              }}
            />
          );
        })}
      </div>

      {/* Freelancers Table */}
      <DataTable
        columns={freelancerColumns}
        data={freelancers}
        title="All Freelancers"
        searchKey="name"
        searchPlaceholder="Search freelancers..."
        enableSorting={true}
        enableFiltering={true}
        enableColumnVisibility={true}
        enablePagination={true}
        pageSize={10}
        pageSizeOptions={[5, 10, 20, 50]}
        initialLoading={initialLoading}
        loading={loading}
      />

      {/* Summary */}
      <div className="mt-4 text-sm text-gray-500">Showing {freelancers.length} freelancers</div>
    </DashboardPageWrapper>
  );
};

export default RealFreelancersPage;
