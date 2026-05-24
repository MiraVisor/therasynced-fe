'use client';

import { Search } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useInfiniteSearchFreelancers } from '@/hooks/queries/useFreelancers';
import { useJobTitles } from '@/hooks/queries/useJobTitles';
import { LocationType, SearchFilters } from '@/types/types';
import { mapOneFreelancerToExpert } from '@/utils/freelancerMapper';

import { DashboardPageWrapper } from '../../DashboardPageWrapper';
import { ExpertList } from './ExpertSection';
import { FilterChips } from './FilterChips';

// Use unified mapping function
const mapFreelancerToExpert = mapOneFreelancerToExpert;

// Enhanced Loading Skeleton
const ExpertCardSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm min-h-[320px] flex flex-col animate-pulse">
    <div className="p-6 flex-1 flex flex-col">
      <div className="flex items-start space-x-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-3 h-3 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
          <div className="h-5 bg-gray-200 rounded w-16 animate-pulse" />
        </div>
      </div>
      <div className="space-y-2 mb-6">
        <div className="h-3 bg-gray-200 rounded w-full animate-pulse" />
        <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
      </div>
      <div className="flex space-x-2 mb-4">
        <div className="h-3 bg-gray-200 rounded w-12 animate-pulse" />
        <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
      </div>
      <div className="mt-auto space-y-3">
        <div className="h-6 bg-gray-200 rounded w-20 animate-pulse" />
        <div className="flex space-x-2">
          <div className="h-9 flex-1 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-9 flex-1 bg-primary/20 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

const UserOverview = () => {
  // Filters state
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    specialty: [],
    serviceCategories: [],
    location: '',
    priceMin: undefined,
    priceMax: undefined,
    sessionType: [],
    availableThisWeek: false,
    verificationStatus: [],
    minRating: undefined,
    tier: [],
  });

  // Sort state
  const [sortBy, setSortBy] = useState<'relevance' | 'rating' | 'availability'>('relevance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch job titles
  const { data: jobTitlesData } = useJobTitles();
  const jobTitles = useMemo(
    () => jobTitlesData?.map((jt) => ({ id: jt.id, name: jt.name })) || [],
    [jobTitlesData],
  );

  // Build search params
  const searchParams = useMemo(() => {
    const params: {
      limit: number;
      sortBy: 'relevance' | 'rating' | 'availability';
      sortOrder: 'asc' | 'desc';
      specialty?: string[];
      serviceCategories?: string[];
      location?: string;
      priceMin?: number;
      priceMax?: number;
      sessionType?: LocationType[];
      availableThisWeek?: boolean;
      verificationStatus?: string;
      minRating?: number;
      tier?: string[];
      query?: string;
    } = {
      limit: 12,
      sortBy,
      sortOrder,
    };

    if (filters.specialty.length > 0) {
      params.specialty = filters.specialty;
    }
    if (filters.serviceCategories.length > 0) {
      params.serviceCategories = filters.serviceCategories;
    }
    if (filters.location) {
      params.location = filters.location;
    }
    if (filters.priceMin !== undefined) {
      params.priceMin = filters.priceMin;
    }
    if (filters.priceMax !== undefined) {
      params.priceMax = filters.priceMax;
    }
    if (filters.sessionType.length > 0) {
      params.sessionType = filters.sessionType;
    }
    if (filters.availableThisWeek) {
      params.availableThisWeek = true;
    }
    if (filters.verificationStatus.length > 0) {
      params.verificationStatus = filters.verificationStatus[0];
    }
    if (filters.minRating !== undefined) {
      params.minRating = filters.minRating;
    }
    if (filters.tier && filters.tier.length > 0) {
      params.tier = filters.tier;
    }
    if (filters.query) {
      params.query = filters.query;
    }

    return params;
  }, [filters, sortBy, sortOrder]);

  // Fetch freelancers with infinite query
  const {
    data,
    isLoading,
    isFetching: _isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteSearchFreelancers(searchParams);

  // Flatten all pages into a single array
  const freelancers = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.freelancers.map(mapFreelancerToExpert));
  }, [data]);

  // Get pagination info from last page
  const pagination = useMemo(() => {
    if (!data?.pages || data.pages.length === 0) return null;
    const lastPage = data.pages[data.pages.length - 1];
    return lastPage?.pagination;
  }, [data]);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
  }, []);

  // Handle clear all filters
  const handleClearAllFilters = useCallback(() => {
    setFilters({
      query: '',
      specialty: [],
      serviceCategories: [],
      location: '',
      priceMin: undefined,
      priceMax: undefined,
      sessionType: [],
      availableThisWeek: false,
      verificationStatus: [],
      minRating: undefined,
      tier: [],
    });
  }, []);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Handle sort change
  const handleSortChange = useCallback((newSortBy: string) => {
    setSortBy(newSortBy as typeof sortBy);
    // Toggle order for some sorts
    if (newSortBy === 'rating') {
      setSortOrder('asc');
    } else {
      setSortOrder('desc');
    }
  }, []);

  return (
    <DashboardPageWrapper
      header={
        <div className="space-y-3">
          <h1 className="text-3xl font-poppins font-bold text-charcoal">
            Find Your Perfect Freelancer
          </h1>
          <p className="text-lg font-inter text-muted-foreground max-w-2xl">
            Connect with qualified mental health professionals who can help you on your journey to
            wellness
          </p>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Filters and Sort Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Filter Chips */}
          <div className="flex-1 w-full">
            <FilterChips
              filters={filters}
              onFiltersChange={handleFiltersChange}
              jobTitles={jobTitles}
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Sort by:</span>
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="availability">Availability</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Header */}
        <div>
          <h2 className="text-2xl font-poppins font-bold text-charcoal">Available Freelancers</h2>
          {pagination && (
            <p className="text-sm font-inter text-muted-foreground mt-1">
              Showing {freelancers.length} of {pagination.total} freelancers
            </p>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <ExpertCardSkeleton key={i} />
            ))}
          </div>
        ) : freelancers.length > 0 ? (
          <>
            <ExpertList experts={freelancers} />
            {hasNextPage && (
              <div className="flex justify-center mt-6">
                <Button
                  onClick={handleLoadMore}
                  disabled={isFetchingNextPage}
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/5"
                >
                  {isFetchingNextPage ? (
                    <span className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      Loading...
                    </span>
                  ) : (
                    `Load More (${(pagination?.total || 0) - freelancers.length} remaining)`
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-poppins font-semibold text-charcoal mb-2">
              No freelancers found
            </h3>
            <p className="font-inter text-muted-foreground mb-4">
              No freelancers match your current filters
            </p>
            <Button
              onClick={handleClearAllFilters}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/5 hover:border-primary/40"
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </DashboardPageWrapper>
  );
};

export default UserOverview;
