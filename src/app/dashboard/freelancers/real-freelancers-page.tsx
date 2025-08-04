'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Clock, Heart, MapPin, Star } from 'lucide-react';
import { useState } from 'react';

import { DataTable } from '@/components/common/DataTable/data-table';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFavoriteFreelancers, useFreelancers } from '@/hooks/useFreelancers';
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
          className="hover:bg-transparent p-0"
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
          className="hover:bg-transparent p-0"
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
];

const RealFreelancersPage = () => {
  const [activeTab, setActiveTab] = useState('all');

  // Fetch all freelancers
  const { freelancers, loading: allLoading, error: allError } = useFreelancers();

  // Fetch favorite freelancers
  const {
    favoriteFreelancers,
    loading: favoritesLoading,
    error: favoritesError,
  } = useFavoriteFreelancers();

  const currentFreelancers = activeTab === 'all' ? freelancers : favoriteFreelancers;
  const currentLoading = activeTab === 'all' ? allLoading : favoritesLoading;
  const currentError = activeTab === 'all' ? allError : favoritesError;

  // Calculate stats
  const stats = [
    {
      title: 'Total Freelancers',
      value: freelancers.length.toString(),
      icon: <Star className="h-6 w-6" />,
      bgColor: '#e8ebfd',
    },
    {
      title: 'Active Freelancers',
      value: freelancers.filter((f) => f.isActive).length.toString(),
      icon: <Clock className="h-6 w-6" />,
      bgColor: '#e7fdf1',
    },
    {
      title: 'Favorite Freelancers',
      value: favoriteFreelancers.length.toString(),
      icon: <Heart className="h-6 w-6" />,
      bgColor: '#fde8e7',
    },
  ];

  if (currentLoading) {
    return (
      <DashboardPageWrapper header={<h2 className="text-xl font-semibold">Freelancers</h2>}>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading freelancers...</div>
        </div>
      </DashboardPageWrapper>
    );
  }

  if (currentError) {
    return (
      <DashboardPageWrapper header={<h2 className="text-xl font-semibold">Freelancers</h2>}>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600">Error: {currentError}</div>
        </div>
      </DashboardPageWrapper>
    );
  }

  return (
    <DashboardPageWrapper
      header={
        <div className="flex items-center space-x-2">
          <h2 className="font-poppins text-[22px] font-bold tracking-tight">
            <span className="text-black">All </span>
            <span className="text-primary">Freelancers</span>
          </h2>
        </div>
      }
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-6 shadow-sm border"
            style={{ backgroundColor: stat.bgColor }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className="p-2 rounded-full bg-white">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs for All vs Favorites */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">All Freelancers</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <DataTable
            columns={freelancerColumns}
            data={currentFreelancers}
            title="All Freelancers"
            searchKey="name"
            searchPlaceholder="Search freelancers..."
            enableSorting={true}
            enableFiltering={true}
            enableColumnVisibility={true}
            enablePagination={true}
            pageSize={10}
            pageSizeOptions={[5, 10, 20, 50]}
          />
        </TabsContent>

        <TabsContent value="favorites" className="mt-6">
          <DataTable
            columns={freelancerColumns}
            data={currentFreelancers}
            title="Favorite Freelancers"
            searchKey="name"
            searchPlaceholder="Search favorite freelancers..."
            enableSorting={true}
            enableFiltering={true}
            enableColumnVisibility={true}
            enablePagination={true}
            pageSize={10}
            pageSizeOptions={[5, 10, 20, 50]}
          />
        </TabsContent>
      </Tabs>

      {/* Summary */}
      <div className="mt-4 text-sm text-gray-500">
        Showing {currentFreelancers.length} freelancers
        {activeTab === 'favorites' && <span> • Only showing favorited freelancers</span>}
      </div>
    </DashboardPageWrapper>
  );
};

export default RealFreelancersPage;
