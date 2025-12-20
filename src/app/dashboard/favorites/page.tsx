'use client';

import { Search } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useFavoriteFreelancers } from '@/hooks/queries/useFreelancers';
import { Expert, Freelancer } from '@/types/types';

import { DashboardPageWrapper } from '../../../components/core/Dashboard/DashboardPageWrapper';
import { ExpertList } from '../../../components/core/Dashboard/UserSide/Overview/ExpertSection';
import ExpertCardSkeleton from '../../../components/ui/skeletons/ExpertCardSkeleton';

// Map freelancer data to Expert format (same as in UserExploreMain)
const mapFreelancerToExpert = (freelancer: Freelancer): Expert => {
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
    rating: validRating,
    reviews: freelancer.favoritedBy?.length || 0,
    description: freelancer.description || cardInfo.title,
    isFavorite: freelancer.isFavorite ?? false,
    // Additional data for profile dialog
    profilePicture: freelancer.profilePicture,
    services: Array.isArray(services) ? services.filter((service) => service?.isActive) : [],
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
    // Tier information
    planFeatures: freelancer.planFeatures || null,
    tier: freelancer.planFeatures?.planType || null,
    // Stamp information (included in API response when user is authenticated)
    stampInfo: freelancer.stampInfo || null,
  };
};

// Enhanced Search Component
const FavoritesSearchBar = ({
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
          placeholder="Search your favorites by name, specialty, or keywords..."
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

const FavoritesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    data: favorites = [],
    isLoading: loading,
    error,
  } = useFavoriteFreelancers({
    name: debouncedSearchQuery || undefined,
  });

  const [filteredFavorites, setFilteredFavorites] = useState<Expert[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback((query: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    setIsSearching(true);

    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(query);
      setIsSearching(false);
    }, 500);
  }, []);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      debouncedSearch(query);
    },
    [debouncedSearch],
  );

  useEffect(() => {
    if (!favorites || !Array.isArray(favorites)) {
      setFilteredFavorites([]);
      return;
    }

    try {
      const mappedFavorites = favorites.map(mapFreelancerToExpert);

      // Apply local filtering if search query exists (as backup to API filtering)
      let filtered = mappedFavorites;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filtered = mappedFavorites.filter((expert) => {
          const name = expert.name?.toLowerCase() || '';
          const specialty = expert.specialty?.toLowerCase() || '';
          const jobTitle = expert.jobTitle?.name?.toLowerCase() || '';
          const description = expert.description?.toLowerCase() || '';

          return (
            name.includes(query) ||
            specialty.includes(query) ||
            jobTitle.includes(query) ||
            description.includes(query)
          );
        });
      }

      setFilteredFavorites(filtered);
      // Clear searching state when data is loaded
      setIsSearching(false);
    } catch (error) {
      // Handle mapping errors gracefully
      setFilteredFavorites([]);
      setIsSearching(false);
    }
  }, [favorites, searchQuery]);

  return (
    <DashboardPageWrapper
      header={
        <div className="space-y-6">
          <div className="space-y-3">
            <h1 className="text-3xl font-poppins font-bold text-charcoal">My Favorites</h1>
            <p className="text-lg font-inter text-muted-foreground max-w-2xl">
              Your saved freelancers and preferred mental health professionals
            </p>
          </div>

          <FavoritesSearchBar onSearch={handleSearch} isSearching={isSearching} />
        </div>
      }
    >
      <div className="space-y-8">
        {/* Results Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-poppins font-semibold text-charcoal">
              {loading
                ? 'Loading favorites...'
                : `${filteredFavorites.length} saved freelancer${filteredFavorites.length !== 1 ? 's' : ''}`}
            </h2>
            {searchQuery && (
              <p className="text-sm font-inter text-muted-foreground mt-1">
                Results for &quot;{searchQuery}&quot;
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
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
              Unable to load favorites
            </h3>
            <p className="font-inter text-muted-foreground mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              Try Again
            </Button>
          </div>
        ) : filteredFavorites.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-poppins font-semibold text-charcoal mb-2">
              {searchQuery ? 'No favorites match your search' : 'No favorites yet'}
            </h3>
            <p className="font-inter text-muted-foreground mb-4">
              {searchQuery
                ? `No saved freelancers match "${searchQuery}". Try adjusting your search.`
                : 'Start exploring freelancers and add them to your favorites to see them here.'}
            </p>
            <div className="flex gap-2 justify-center">
              {searchQuery && (
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearching(false);
                    // Clear any pending debounce
                    if (debounceTimeoutRef.current) {
                      clearTimeout(debounceTimeoutRef.current);
                    }
                    setDebouncedSearchQuery('');
                  }}
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/5 hover:border-primary/40"
                >
                  Clear Search
                </Button>
              )}
              <Button
                onClick={() => (window.location.href = '/dashboard/explore')}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                Explore Freelancers
              </Button>
            </div>
          </div>
        ) : (
          <ExpertList experts={filteredFavorites} />
        )}
      </div>
    </DashboardPageWrapper>
  );
};

export default FavoritesPage;
