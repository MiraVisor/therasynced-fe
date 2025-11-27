'use client';

import { Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { freelancerService } from '@/services/freelancerService';
import { jobTitleService } from '@/services/jobTitleService';
import { Expert, SearchFilters } from '@/types/types';

import { DashboardPageWrapper } from '../../DashboardPageWrapper';
import { ExpertList } from './ExpertSection';
import { FilterChips } from './FilterChips';

const mapFreelancerToExpert = (freelancer: any): Expert => {
  // Extract services and their location types
  const services = freelancer.services || [];
  const allLocationTypes = new Set<string>();

  // Convert location types to session types

  // Get primary service name
  const primaryService = services.length > 0 ? services[0]?.name : undefined;

  // Get location information
  const locations = freelancer.locations || [];

  // Calculate experience from creation date

  // Get rating and reviews from cardInfo
  const cardInfo = freelancer.cardInfo || {};
  // Use cardInfo.averageRating as primary source (real calculated ratings from API)
  const rating =
    cardInfo.averageRating !== undefined && cardInfo.averageRating !== null
      ? cardInfo.averageRating
      : freelancer.averageRating;

  // Only use rating if it's a valid number greater than 0
  const validRating = rating !== undefined && rating !== null && rating > 0 ? rating : undefined;

  // Map API freelancer to Expert type for UI
  return {
    id: freelancer.id,
    name: freelancer.name || cardInfo.name,
    specialty: cardInfo.mainService || primaryService,
    jobTitle: freelancer.mainJobTitle,
    rating: validRating,
    reviews: cardInfo.totalRatings || freelancer.cardInfo?.patientStories || 0,
    description: freelancer.description || cardInfo.title,
    isFavorite: freelancer.isFavorite ?? false,
    // Additional data for profile dialog
    profilePicture: freelancer.profilePicture,
    slots: freelancer.slots || [],
    slotSummary: freelancer.slotSummary || {},
    cardInfo: cardInfo,
    availableSlots: freelancer.slotSummary?.availableSlots || 0,
    totalSlots: freelancer.slotSummary?.totalSlots || 0,
    planFeatures: freelancer.planFeatures || null,
    tier: freelancer.planFeatures?.planType || null,
    subscriptionStatus: freelancer.subscriptionStatus || undefined,
    stampInfo: freelancer.stampInfo || null,
  };
};

// Enhanced Loading Skeleton
const ExpertCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm min-h-[320px] flex flex-col animate-pulse">
    <div className="p-6 flex-1 flex flex-col">
      <div className="flex items-start space-x-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700/60 rounded w-1/2 animate-pulse"></div>
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 bg-gray-200 dark:bg-gray-700/60 rounded animate-pulse"
              ></div>
            ))}
          </div>
          <div className="h-5 bg-gray-200 dark:bg-gray-700/30 rounded w-16 animate-pulse"></div>
        </div>
      </div>
      <div className="space-y-2 mb-6">
        <div className="h-3 bg-gray-200 dark:bg-gray-700/60 rounded w-full animate-pulse"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700/60 rounded w-2/3 animate-pulse"></div>
      </div>
      <div className="flex space-x-2 mb-4">
        <div className="h-3 bg-gray-200 dark:bg-gray-700/60 rounded w-12 animate-pulse"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700/60 rounded w-16 animate-pulse"></div>
      </div>
      <div className="mt-auto space-y-3">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
        <div className="flex space-x-2">
          <div className="h-9 flex-1 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="h-9 flex-1 bg-primary/20 dark:bg-primary/10 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
);

const UserOverview = () => {
  // Single state for all freelancers
  const [freelancers, setFreelancers] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Pagination
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null>(null);

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

  // Filter options data
  const [jobTitles, setJobTitles] = useState<Array<{ id: string; name: string }>>([]);

  // Fetch job titles on mount
  useEffect(() => {
    const fetchJobTitles = async () => {
      const response = await jobTitleService.getActiveJobTitles();
      if (response.success) {
        setJobTitles(response.data.map((jt) => ({ id: jt.id, name: jt.name })));
      }
    };
    fetchJobTitles();
  }, []);

  // Fetch freelancers with current filters and sort
  const fetchFreelancers = useCallback(
    async (page: number = 1, append: boolean = false) => {
      const limit = 12;
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        // Build search params - need to handle arrays properly for backend
        const searchParams: {
          page: number;
          limit: number;
          sortBy: 'relevance' | 'rating' | 'availability';
          sortOrder: 'asc' | 'desc';
          specialty?: string[];
          serviceCategories?: string[];
          location?: string;
          priceMin?: number;
          priceMax?: number;
          sessionType?: ('HOME' | 'CLINIC')[];
          availableThisWeek?: boolean;
          verificationStatus?: string;
          minRating?: number;
          tier?: string[];
        } = {
          page,
          limit,
          sortBy,
          sortOrder,
        };

        // Add filters
        if (filters.specialty.length > 0) {
          searchParams.specialty = filters.specialty;
        }
        if (filters.serviceCategories.length > 0) {
          searchParams.serviceCategories = filters.serviceCategories;
        }
        if (filters.location) {
          searchParams.location = filters.location;
        }
        if (filters.priceMin !== undefined) {
          searchParams.priceMin = filters.priceMin;
        }
        if (filters.priceMax !== undefined) {
          searchParams.priceMax = filters.priceMax;
        }
        if (filters.sessionType.length > 0) {
          searchParams.sessionType = filters.sessionType;
        }
        if (filters.availableThisWeek) {
          searchParams.availableThisWeek = true;
        }
        // Backend expects verificationStatus as single value, not array
        if (filters.verificationStatus.length > 0) {
          // Send first value as single string (backend doesn't accept array)
          searchParams.verificationStatus = filters.verificationStatus[0];
        }
        if (filters.minRating !== undefined) {
          searchParams.minRating = filters.minRating;
        }
        if (filters.tier && filters.tier.length > 0) {
          searchParams.tier = filters.tier;
        }

        const response = await freelancerService.searchFreelancers(searchParams);

        if (response.success && Array.isArray(response.data)) {
          const mapped = response.data.map(mapFreelancerToExpert);
          if (page === 1 || !append) {
            setFreelancers(mapped);
          } else {
            setFreelancers((prev) => [...prev, ...mapped]);
          }
          setPagination(response.pagination);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching freelancers:', error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setInitialLoading(false);
      }
    },
    [filters, sortBy, sortOrder],
  );

  // Fetch on initial load and when filters/sort change
  useEffect(() => {
    fetchFreelancers(1, false);
  }, [fetchFreelancers]);

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
    if (pagination?.hasNext && !loadingMore) {
      fetchFreelancers((pagination.page || 1) + 1, true);
    }
  }, [pagination, loadingMore, fetchFreelancers]);

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
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Sort by:
            </span>
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
          <h2 className="text-2xl font-poppins font-bold text-charcoal">Available Therapists</h2>
          {pagination && (
            <p className="text-sm font-inter text-muted-foreground mt-1">
              Showing {freelancers.length} of {pagination.total} therapists
            </p>
          )}
        </div>

        {/* Content */}
        {initialLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <ExpertCardSkeleton key={i} />
            ))}
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <ExpertCardSkeleton key={`loading-${i}`} />
            ))}
          </div>
        ) : freelancers.length > 0 ? (
          <>
            <ExpertList experts={freelancers} />
            {pagination?.hasNext && (
              <div className="flex justify-center mt-6">
                <Button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/5"
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      Loading...
                    </span>
                  ) : (
                    `Load More (${(pagination.total || 0) - freelancers.length} remaining)`
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-poppins font-semibold text-charcoal mb-2">
              No therapists found
            </h3>
            <p className="font-inter text-muted-foreground mb-4">
              No therapists match your current filters
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
