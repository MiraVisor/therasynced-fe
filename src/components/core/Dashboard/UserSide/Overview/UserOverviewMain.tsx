'use client';

import { Search } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { getPatientStamps } from '@/redux/api/loyaltyApi';
import { fetchFreelancers, loadMoreFreelancers } from '@/redux/slices/overviewSlice';
import { RootState } from '@/redux/store';
import { Expert } from '@/types/types';

import { DashboardPageWrapper } from '../../DashboardPageWrapper';
import { ExpertList } from './ExpertSection';

const mapFreelancerToExpert = (freelancer: any): Expert => {
  // Extract services and their location types
  const services = freelancer.services || [];
  const allLocationTypes = new Set<string>();

  // Convert location types to session types
  const sessionTypes = Array.from(allLocationTypes).map((type) => {
    switch (type) {
      case 'HOME':
        return 'home';
      case 'CLINIC':
        return 'clinic';
      default:
        return 'home';
    }
  });

  // Get primary service name
  const primaryService = services.length > 0 ? services[0]?.name : undefined;

  // Get location information
  const locations = freelancer.locations || [];
  const primaryLocation = locations.length > 0 ? locations[0]?.name : undefined;

  // Calculate experience from creation date
  const createdAt = freelancer.createdAt ? new Date(freelancer.createdAt) : null;
  const yearsOfExperience = createdAt
    ? Math.floor((new Date().getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 365))
    : undefined;

  // Get rating and reviews from cardInfo
  const cardInfo = freelancer.cardInfo || {};
  const rating = cardInfo.averageRating || freelancer.averageRating;

  // Only use rating if it's a valid number greater than 0
  const validRating = rating && rating > 0 ? rating : undefined;

  // Map API freelancer to Expert type for UI
  return {
    id: freelancer.id,
    name: freelancer.name || cardInfo.name,
    specialty: cardInfo.mainService || primaryService,
    jobTitle: freelancer.mainJobTitle, // Add job title mapping
    yearsOfExperience: yearsOfExperience?.toString() || '',
    rating: validRating,
    reviews: freelancer.favoritedBy?.length || 0,
    description: freelancer.description || cardInfo.title,
    isFavorite: freelancer.isFavorite ?? false,
    // Additional data for profile dialog
    profilePicture: freelancer.profilePicture,
    services: Array.isArray(services)
      ? services.filter((service: any) => service && service.isActive)
      : [],
    location: primaryLocation,
    sessionTypes: sessionTypes,
    pricing: freelancer.pricing,
    // Additional data from API
    email: freelancer.email,
    gender: freelancer.gender,
    city: freelancer.city,
    isEmailVerified: freelancer.isEmailVerified,
    isActive: freelancer.isActive,
    authProvider: freelancer.authProvider,
    verificationStatus: freelancer.verificationStatus,
    firstAidCertificateStatus: freelancer.firstAidCertificateStatus,
    // Slot information
    slots: freelancer.slots || [],
    slotSummary: freelancer.slotSummary || {},
    // Favorites information
    favoritedBy: freelancer.favoritedBy || [],
    // Card info
    cardInfo: cardInfo,
    // Available slots count
    availableSlots: freelancer.slotSummary?.availableSlots || 0,
    totalSlots: freelancer.slotSummary?.totalSlots || 0,
  };
};

// Enhanced Search and Filter Component
const EnhancedSearchBar = ({
  onSearch,
  isSearching,
}: {
  onSearch: (query: string) => void;
  isSearching: boolean;
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          placeholder="Search freelancers by name, specialty, or keywords..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 pr-4 py-3 text-base border-gray-200 focus:border-primary focus:ring-primary"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <LoadingSpinner size="md" />
          </div>
        )}
      </div>
    </div>
  );
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
  const dispatch = useDispatch();
  const { experts, loading, initialLoading, error, pagination, loadingMore } = useSelector(
    (state: RootState) => state.overview,
  );
  const { stampSummaries, isLoading: stampsLoading } = useSelector(
    (state: RootState) => state.stamps,
  );
  const [filteredExperts, setFilteredExperts] = useState<Expert[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const stampsFetchedRef = useRef(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    (query: string) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      setIsSearching(true);

      debounceTimeoutRef.current = setTimeout(() => {
        setSearchQuery(query);
        // Trigger new fetch with search query
        dispatch(fetchFreelancers({ page: 1, limit: 6, name: query || undefined }) as any);
        setIsSearching(false);
      }, 500);
    },
    [dispatch],
  );

  const handleSearch = useCallback(
    (query: string) => {
      debouncedSearch(query);
    },
    [debouncedSearch],
  );

  // Infinite scroll setup
  const hasNextPage = pagination?.hasNext || false;

  // Debug pagination state
  useEffect(() => {}, [pagination, hasNextPage]);

  const handleLoadMore = () => {
    if (pagination && hasNextPage && !loadingMore) {
      dispatch(
        loadMoreFreelancers({
          page: pagination.page + 1,
          limit: 6,
          name: searchQuery || undefined,
        }) as any,
      );
    }
  };

  const { loadingRef } = useInfiniteScroll({
    hasNextPage,
    isLoading: loadingMore,
    onLoadMore: handleLoadMore,
    threshold: 200,
  });

  // Only fetch initial data if we don't have a search query active
  useEffect(() => {
    // Don't fetch if there's an active search query
    if (searchQuery) return;

    const hasExperts = experts.length > 0;
    dispatch(fetchFreelancers({ page: 1, limit: 6, silent: hasExperts }) as any);
  }, [dispatch, experts.length, searchQuery]);

  // Fetch stamps once when page loads (only if not already loaded or loading)
  useEffect(() => {
    // Only fetch if:
    // 1. Not currently loading
    // 2. Not already fetched (using ref to prevent re-fetches on re-renders)
    // 3. No stamps data exists
    if (
      !stampsLoading &&
      !stampsFetchedRef.current &&
      (!stampSummaries || stampSummaries.length === 0)
    ) {
      stampsFetchedRef.current = true;
      dispatch(getPatientStamps() as any);
    }
    // Reset ref if stamps are loaded (for future refreshes if needed)
    if (stampSummaries && stampSummaries.length > 0) {
      stampsFetchedRef.current = true;
    }
  }, [dispatch, stampsLoading, stampSummaries?.length]);

  useEffect(() => {
    if (!experts || !Array.isArray(experts)) {
      setFilteredExperts([]);
      return;
    }

    // Map experts directly without client-side filtering since we do server-side search now
    try {
      const mappedExperts = experts.map(mapFreelancerToExpert);
      setFilteredExperts(mappedExperts);
      // Clear searching state when data is loaded
      setIsSearching(false);
    } catch (error) {
      // Handle mapping errors gracefully
      setFilteredExperts([]);
      setIsSearching(false);
    }
  }, [experts]);

  return (
    <DashboardPageWrapper
      header={
        <div className="space-y-6">
          <div className="space-y-3">
            <h1 className="text-3xl font-poppins font-bold text-charcoal">
              Find Your Perfect Freelancer
            </h1>
            <p className="text-lg font-inter text-muted-foreground max-w-2xl">
              Connect with qualified mental health professionals who can help you on your journey to
              wellness
            </p>
          </div>

          <EnhancedSearchBar onSearch={handleSearch} isSearching={isSearching || loading} />
        </div>
      }
    >
      <div className="space-y-8">
        {/* Results Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-poppins font-semibold text-charcoal">
              {initialLoading || (loading && experts.length === 0)
                ? 'Loading freelancers...'
                : `${filteredExperts.length} freelancers found`}
            </h2>
            {searchQuery && (
              <p className="text-sm font-inter text-muted-foreground mt-1">
                Results for {searchQuery}
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        {initialLoading || (loading && experts.length === 0) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <ExpertCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-error/10 rounded-full flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-poppins font-semibold text-charcoal mb-2">
              Unable to load freelancers
            </h3>
            <p className="font-inter text-muted-foreground mb-4">{error}</p>
            <Button
              onClick={() => dispatch(fetchFreelancers({ page: 1, limit: 12 }) as any)}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              Try Again
            </Button>
          </div>
        ) : filteredExperts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-poppins font-semibold text-charcoal mb-2">
              No freelancers found
            </h3>
            <p className="font-inter text-muted-foreground mb-4">
              {searchQuery
                ? `No freelancers match your search for ${searchQuery}`
                : 'Try adjusting your search criteria or filters'}
            </p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setIsSearching(false);
                // Clear any pending debounce
                if (debounceTimeoutRef.current) {
                  clearTimeout(debounceTimeoutRef.current);
                }
                dispatch(fetchFreelancers({ page: 1, limit: 6 }) as any);
              }}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/5 hover:border-primary/40"
            >
              Clear Search
            </Button>
          </div>
        ) : (
          <>
            <ExpertList experts={filteredExperts} />

            {/* Infinite Scroll Loading Indicator */}
            {hasNextPage && (
              <div ref={loadingRef} className="flex justify-center py-8">
                {loadingMore ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 w-full">
                    {Array.from({ length: 3 }).map((i) => (
                      <ExpertCardSkeleton key={`loading-${i}`} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center">
                    <LoadingSpinner size="md" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Loading more freelancers...
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardPageWrapper>
  );
};

export default UserOverview;
