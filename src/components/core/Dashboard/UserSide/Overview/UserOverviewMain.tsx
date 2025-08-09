'use client';

import { Filter, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useAuth } from '@/redux/hooks/useAppHooks';
import { fetchFreelancers, loadMoreFreelancers } from '@/redux/slices/overviewSlice';
import { RootState } from '@/redux/store';
import { Expert } from '@/types/types';

import { DashboardPageWrapper } from '../../DashboardPageWrapper';
import { ExpertList } from './ExpertSection';

const mapFreelancerToExpert = (freelancer: any): Expert => {
  // Extract services and their location types
  const services = freelancer.services || [];
  const allLocationTypes = new Set<string>();
  services.forEach((service: any) => {
    if (service.locationTypes) {
      service.locationTypes.forEach((type: string) => allLocationTypes.add(type));
    }
  });

  // Convert location types to session types
  const sessionTypes = Array.from(allLocationTypes).map((type) => {
    switch (type) {
      case 'VIRTUAL':
        return 'online';
      case 'OFFICE':
        return 'office';
      case 'HOME':
        return 'home';
      case 'CLINIC':
        return 'office';
      default:
        return 'online';
    }
  });

  // Calculate pricing from services
  const pricing = {
    online: { min: 80, max: 120 },
    office: { min: 100, max: 150 },
    home: { min: 120, max: 180 },
  };

  // Get primary service name
  const primaryService = services.length > 0 ? services[0].name : 'Therapy';

  // Get location information
  const locations = freelancer.locations || [];
  const primaryLocation = locations.length > 0 ? locations[0].name : 'Online';

  // Calculate experience from creation date or use default
  const createdAt = freelancer.createdAt ? new Date(freelancer.createdAt) : null;
  const yearsOfExperience = createdAt
    ? Math.floor((new Date().getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 365))
    : 5;

  // Get rating and reviews from cardInfo
  const cardInfo = freelancer.cardInfo || {};
  const rating = cardInfo.averageRating || freelancer.averageRating || 4.0;

  // Map API freelancer to Expert type for UI
  return {
    id: freelancer.id,
    name: freelancer.name || cardInfo.name,
    specialty: cardInfo.mainService || primaryService,
    yearsOfExperience: yearsOfExperience.toString(),
    rating: rating,
    reviews: freelancer.favoritedBy?.length || 0,
    description: freelancer.description || cardInfo.title,
    isFavorite: freelancer.isFavorite ?? false,
    // Additional data for profile dialog
    profilePicture: freelancer.profilePicture,
    services: services,
    location: primaryLocation,
    languages: ['English'], // Default, can be extended if API provides languages
    education: [], // Can be extended if API provides education
    certifications: [], // Can be extended if API provides certifications
    sessionTypes: sessionTypes.length > 0 ? sessionTypes : ['online', 'office'],
    pricing: pricing,
    // Additional data from API
    email: freelancer.email,
    gender: freelancer.gender,
    city: freelancer.city,
    isEmailVerified: freelancer.isEmailVerified,
    isActive: freelancer.isActive,
    authProvider: freelancer.authProvider,
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
    nextAvailableSlot: freelancer.slotSummary?.nextAvailable,
  };
};

// Enhanced Search and Filter Component
const EnhancedSearchBar = ({
  onSearch,
  onFilterChange,
}: {
  onSearch: (query: string) => void;
  onFilterChange: (filters: any) => void;
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    sessionType: 'all',
    priceRange: 'all',
    rating: 'all',
    availability: 'all',
  });

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          placeholder="Search therapists by name, specialty, or keywords..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 pr-4 py-3 text-base border-gray-200 focus:border-primary focus:ring-primary"
        />
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-3">
        <Select
          value={filters.sessionType}
          onValueChange={(value) => handleFilterChange('sessionType', value)}
        >
          <SelectTrigger className="w-auto min-w-[140px]">
            <SelectValue placeholder="Session Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="office">Office</SelectItem>
            <SelectItem value="home">Home Visit</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.priceRange}
          onValueChange={(value) => handleFilterChange('priceRange', value)}
        >
          <SelectTrigger className="w-auto min-w-[140px]">
            <SelectValue placeholder="Price Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Prices</SelectItem>
            <SelectItem value="0-50">€0 - €50</SelectItem>
            <SelectItem value="50-100">€50 - €100</SelectItem>
            <SelectItem value="100-150">€100 - €150</SelectItem>
            <SelectItem value="150+">€150+</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.rating}
          onValueChange={(value) => handleFilterChange('rating', value)}
        >
          <SelectTrigger className="w-auto min-w-[140px]">
            <SelectValue placeholder="Rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            <SelectItem value="4.5+">4.5+ Stars</SelectItem>
            <SelectItem value="4.0+">4.0+ Stars</SelectItem>
            <SelectItem value="3.5+">3.5+ Stars</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.availability}
          onValueChange={(value) => handleFilterChange('availability', value)}
        >
          <SelectTrigger className="w-auto min-w-[140px]">
            <SelectValue placeholder="Availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="available">Available Today</SelectItem>
            <SelectItem value="this-week">This Week</SelectItem>
            <SelectItem value="next-week">Next Week</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

// Enhanced Loading Skeleton
const ExpertCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
    <div className="p-6 flex-1 flex flex-col">
      <div className="flex items-start space-x-4 mb-6">
        <Skeleton className="w-20 h-20 rounded-full" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="w-4 h-4 rounded" />
            ))}
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
      <div className="space-y-2 mb-6">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex space-x-2 mb-4">
        <Skeleton className="h-4 w-16 rounded" />
        <Skeleton className="h-4 w-20 rounded" />
      </div>
      <div className="mt-auto space-y-4">
        <Skeleton className="h-8 w-24" />
        <div className="flex space-x-2">
          <Skeleton className="h-11 flex-1 rounded-lg" />
          <Skeleton className="h-11 flex-1 rounded-lg" />
        </div>
      </div>
    </div>
  </div>
);

const UserOverview = () => {
  const dispatch = useDispatch();
  const { experts, loading, error, pagination, loadingMore } = useSelector(
    (state: RootState) => state.overview,
  );
  const [filteredExperts, setFilteredExperts] = useState<Expert[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<any>({});

  // Infinite scroll setup
  const hasNextPage = pagination?.hasNext || false;

  // Debug pagination state
  useEffect(() => {
    console.log('Pagination state changed:', pagination);
    console.log('hasNextPage:', hasNextPage);
  }, [pagination, hasNextPage]);

  const handleLoadMore = () => {
    console.log('handleLoadMore called', { pagination, hasNextPage, loadingMore });
    if (pagination && hasNextPage && !loadingMore) {
      console.log('Dispatching loadMoreFreelancers', {
        page: pagination.page + 1,
        limit: 6,
      });
      dispatch(
        loadMoreFreelancers({
          page: pagination.page + 1,
          limit: 6, // Keep the same limit as initial fetch
        }) as any,
      );
    } else {
      console.log('Load more conditions not met:', {
        hasPagination: !!pagination,
        hasNextPage,
        loadingMore,
      });
    }
  };

  const { loadingRef } = useInfiniteScroll({
    hasNextPage,
    isLoading: loadingMore,
    onLoadMore: handleLoadMore,
    threshold: 200,
  });

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      return; // Don't make API calls if not authenticated
    }
    dispatch(fetchFreelancers({ page: 1, limit: 6 }) as any);
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    const mappedExperts = experts.map(mapFreelancerToExpert);
    let filtered = mappedExperts;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (expert) =>
          expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          expert.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
          expert.description.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Apply other filters
    if (activeFilters.sessionType && activeFilters.sessionType !== 'all') {
      filtered = filtered.filter((expert) =>
        (expert.sessionTypes || []).includes(activeFilters.sessionType),
      );
    }

    if (activeFilters.rating && activeFilters.rating !== 'all') {
      const minRating = parseFloat(activeFilters.rating);
      filtered = filtered.filter((expert) => expert.rating >= minRating);
    }

    if (activeFilters.availability && activeFilters.availability !== 'all') {
      if (activeFilters.availability === 'available') {
        filtered = filtered.filter((expert) => (expert.availableSlots || 0) > 0);
      }
    }

    setFilteredExperts(filtered);
  }, [experts, searchQuery, activeFilters]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filters: any) => {
    setActiveFilters(filters);
  };

  return (
    <DashboardPageWrapper
      header={
        <div className="space-y-6">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Find Your Perfect Therapist
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
              Connect with qualified mental health professionals who can help you on your journey to
              wellness
            </p>
          </div>

          <EnhancedSearchBar onSearch={handleSearch} onFilterChange={handleFilterChange} />
        </div>
      }
    >
      <div className="space-y-8">
        {/* Results Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {loading ? 'Loading therapists...' : `${filteredExperts.length} therapists found`}
            </h2>
            {searchQuery && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Results for &quot;{searchQuery}&quot;
              </p>
            )}
          </div>

          {!loading && filteredExperts.length > 0 && (
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {Object.values(activeFilters).filter((f) => f !== 'all').length} filters active
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ExpertCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Unable to load therapists
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button
              onClick={() => dispatch(fetchFreelancers({ page: 1, limit: 12 }) as any)}
              className="bg-primary hover:bg-primary/90"
            >
              Try Again
            </Button>
          </div>
        ) : filteredExperts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No therapists found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchQuery
                ? `No therapists match your search for &quot;${searchQuery}&quot;`
                : 'Try adjusting your search criteria or filters'}
            </p>
            {(searchQuery || Object.values(activeFilters).some((f) => f !== 'all')) && (
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setActiveFilters({});
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <ExpertList experts={filteredExperts} />

            {/* Infinite Scroll Loading Indicator */}
            {hasNextPage && (
              <div ref={loadingRef} className="flex justify-center py-8">
                {loadingMore ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                    {[1, 2, 3].map((i) => (
                      <ExpertCardSkeleton key={`loading-${i}`} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Loading more therapists...
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
