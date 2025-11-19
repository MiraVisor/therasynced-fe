'use client';

import { Search } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { freelancerService } from '@/services/freelancerService';
import { Expert } from '@/types/types';
import { getCurrentFeaturedTier } from '@/utils/tierUtils';

import { DashboardPageWrapper } from '../../DashboardPageWrapper';
import { ExpertList } from './ExpertSection';
import SearchWithDropdown from './SearchWithDropdown';

const mapFreelancerToExpert = (freelancer: any): Expert => {
  // Debug: Log raw freelancer data to check structure
  if (!freelancer.planFeatures && freelancer.id) {
    // eslint-disable-next-line no-console
    console.log('Freelancer missing planFeatures:', {
      id: freelancer.id,
      name: freelancer.name,
      hasPlanFeatures: !!freelancer.planFeatures,
      allKeys: Object.keys(freelancer),
      subscriptionPlan: freelancer.subscriptionPlan,
      tier: freelancer.tier,
    });
  }
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
    // Tier information
    planFeatures: freelancer.planFeatures || null,
    tier: freelancer.planFeatures?.planType || null,
    // Stamp information (included in API response when user is authenticated)
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
  // Separate state for each tier
  const [goldFreelancers, setGoldFreelancers] = useState<Expert[]>([]);
  const [silverFreelancers, setSilverFreelancers] = useState<Expert[]>([]);
  const [bronzeFreelancers, setBronzeFreelancers] = useState<Expert[]>([]);

  // Loading states per tier
  const [loadingGold, setLoadingGold] = useState(false);
  const [loadingSilver, setLoadingSilver] = useState(false);
  const [loadingBronze, setLoadingBronze] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Pagination per tier
  const [goldPagination, setGoldPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null>(null);
  const [silverPagination, setSilverPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null>(null);
  const [bronzePagination, setBronzePagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null>(null);

  // Loading more states per tier
  const [loadingMoreGold, setLoadingMoreGold] = useState(false);
  const [loadingMoreSilver, setLoadingMoreSilver] = useState(false);
  const [loadingMoreBronze, setLoadingMoreBronze] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Featured tier from backend (with fallback to local calculation)
  const defaultTier = getCurrentFeaturedTier(); // Fallback
  const [activeTab, setActiveTab] = useState<'gold' | 'silver' | 'bronze'>(defaultTier);
  const featuredTierSetRef = useRef(false); // Track if we've set tab from backend

  // Fetch tier-specific freelancers
  const fetchTierFreelancers = useCallback(
    async (
      tier: 'gold' | 'silver' | 'bronze',
      page: number = 1,
      name?: string,
      append: boolean = false,
    ) => {
      const limit = 6;
      try {
        if (tier === 'gold') {
          if (append) {
            setLoadingMoreGold(true);
          } else {
            setLoadingGold(true);
          }
          const response = await freelancerService.getGoldFreelancers({ page, limit, name });
          if (response.success && Array.isArray(response.data)) {
            const mapped = response.data.map(mapFreelancerToExpert);
            if (page === 1 || !append) {
              setGoldFreelancers(mapped);
            } else {
              setGoldFreelancers((prev) => [...prev, ...mapped]);
            }
            setGoldPagination(response.pagination);

            // Extract featuredTier from backend response (only on first page load)
            if (page === 1 && !append && response.featuredTier && !featuredTierSetRef.current) {
              // Set active tab to featured tier on initial load (only once)
              setActiveTab(response.featuredTier);
              featuredTierSetRef.current = true;
            }
          }
          setLoadingGold(false);
          setLoadingMoreGold(false);
        } else if (tier === 'silver') {
          if (append) {
            setLoadingMoreSilver(true);
          } else {
            setLoadingSilver(true);
          }
          const response = await freelancerService.getSilverFreelancers({ page, limit, name });
          if (response.success && Array.isArray(response.data)) {
            const mapped = response.data.map(mapFreelancerToExpert);
            if (page === 1 || !append) {
              setSilverFreelancers(mapped);
            } else {
              setSilverFreelancers((prev) => [...prev, ...mapped]);
            }
            setSilverPagination(response.pagination);

            // Extract featuredTier from backend response (only on first page load)
            if (page === 1 && !append && response.featuredTier && !featuredTierSetRef.current) {
              // Set active tab to featured tier on initial load (only once)
              setActiveTab(response.featuredTier);
              featuredTierSetRef.current = true;
            }
          }
          setLoadingSilver(false);
          setLoadingMoreSilver(false);
        } else if (tier === 'bronze') {
          if (append) {
            setLoadingMoreBronze(true);
          } else {
            setLoadingBronze(true);
          }
          const response = await freelancerService.getBronzeFreelancers({ page, limit, name });
          if (response.success && Array.isArray(response.data)) {
            const mapped = response.data.map(mapFreelancerToExpert);
            if (page === 1 || !append) {
              setBronzeFreelancers(mapped);
            } else {
              setBronzeFreelancers((prev) => [...prev, ...mapped]);
            }
            setBronzePagination(response.pagination);

            // Extract featuredTier from backend response (only on first page load)
            if (page === 1 && !append && response.featuredTier && !featuredTierSetRef.current) {
              // Set active tab to featured tier on initial load (only once)
              setActiveTab(response.featuredTier);
              featuredTierSetRef.current = true;
            }
          }
          setLoadingBronze(false);
          setLoadingMoreBronze(false);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Error fetching ${tier} freelancers:`, error);
        if (tier === 'gold') {
          setLoadingGold(false);
          setLoadingMoreGold(false);
        } else if (tier === 'silver') {
          setLoadingSilver(false);
          setLoadingMoreSilver(false);
        } else if (tier === 'bronze') {
          setLoadingBronze(false);
          setLoadingMoreBronze(false);
        }
      }
    },
    [],
  );

  // Load more handlers for each tier
  const handleLoadMoreGold = useCallback(() => {
    if (goldPagination?.hasNext && !loadingMoreGold) {
      fetchTierFreelancers('gold', (goldPagination.page || 1) + 1, searchQuery || undefined, true);
    }
  }, [goldPagination, loadingMoreGold, searchQuery, fetchTierFreelancers]);

  const handleLoadMoreSilver = useCallback(() => {
    if (silverPagination?.hasNext && !loadingMoreSilver) {
      fetchTierFreelancers(
        'silver',
        (silverPagination.page || 1) + 1,
        searchQuery || undefined,
        true,
      );
    }
  }, [silverPagination, loadingMoreSilver, searchQuery, fetchTierFreelancers]);

  const handleLoadMoreBronze = useCallback(() => {
    if (bronzePagination?.hasNext && !loadingMoreBronze) {
      fetchTierFreelancers(
        'bronze',
        (bronzePagination.page || 1) + 1,
        searchQuery || undefined,
        true,
      );
    }
  }, [bronzePagination, loadingMoreBronze, searchQuery, fetchTierFreelancers]);

  // Fetch all tiers on initial load
  useEffect(() => {
    if (searchQuery) return; // Don't fetch if searching

    setInitialLoading(true);
    // Fetch Gold first to get featuredTier, then fetch others
    fetchTierFreelancers('gold', 1)
      .then(() => {
        // After getting featuredTier from Gold response, fetch other tiers
        return Promise.all([fetchTierFreelancers('silver', 1), fetchTierFreelancers('bronze', 1)]);
      })
      .finally(() => {
        setInitialLoading(false);
      });
  }, [fetchTierFreelancers, searchQuery]);

  // Debounced search function
  const debouncedSearch = useCallback(
    (query: string) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      setIsSearching(true);

      debounceTimeoutRef.current = setTimeout(() => {
        setSearchQuery(query);
        // Fetch all tiers with search query
        Promise.all([
          fetchTierFreelancers('gold', 1, query || undefined),
          fetchTierFreelancers('silver', 1, query || undefined),
          fetchTierFreelancers('bronze', 1, query || undefined),
        ]).finally(() => {
          setIsSearching(false);
        });
      }, 500);
    },
    [fetchTierFreelancers],
  );

  const handleSearch = useCallback(
    (query: string) => {
      debouncedSearch(query);
    },
    [debouncedSearch],
  );

  // Calculate totals
  const totalFreelancers =
    goldFreelancers.length + silverFreelancers.length + bronzeFreelancers.length;

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

          <SearchWithDropdown onSearch={handleSearch} isSearching={isSearching} />
        </div>
      }
    >
      <div className="space-y-8">
        {/* Search Results Info */}
        {searchQuery && (
          <div>
            <p className="text-sm font-inter text-muted-foreground">
              Results for &quot;{searchQuery}&quot;
            </p>
          </div>
        )}

        {/* Content */}
        {initialLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <ExpertCardSkeleton key={i} />
            ))}
          </div>
        ) : totalFreelancers === 0 ? (
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
                // Refetch all tiers
                Promise.all([
                  fetchTierFreelancers('gold', 1),
                  fetchTierFreelancers('silver', 1),
                  fetchTierFreelancers('bronze', 1),
                ]);
              }}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/5 hover:border-primary/40"
            >
              Clear Search
            </Button>
          </div>
        ) : (
          <>
            {/* Featured Therapists with Tabs */}
            <div className="space-y-6">
              {!searchQuery && (
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-poppins font-bold text-charcoal">
                      Featured Therapists
                    </h2>
                    <p className="text-sm font-inter text-muted-foreground mt-1">
                      Default tab rotates daily for equal visibility
                    </p>
                  </div>
                </div>
              )}

              {searchQuery ? (
                // Show all results combined when searching
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-poppins font-bold text-charcoal">
                      Search Results
                    </h2>
                  </div>
                  {loadingGold || loadingSilver || loadingBronze ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <ExpertCardSkeleton key={`search-skeleton-${i}`} />
                      ))}
                    </div>
                  ) : (
                    <>
                      <ExpertList
                        experts={[...goldFreelancers, ...silverFreelancers, ...bronzeFreelancers]}
                      />
                      {(goldPagination?.hasNext ||
                        silverPagination?.hasNext ||
                        bronzePagination?.hasNext) && (
                        <div className="flex justify-center mt-6">
                          <Button
                            onClick={() => {
                              // Load more for all tiers that have more
                              if (goldPagination?.hasNext && !loadingMoreGold) {
                                handleLoadMoreGold();
                              }
                              if (silverPagination?.hasNext && !loadingMoreSilver) {
                                handleLoadMoreSilver();
                              }
                              if (bronzePagination?.hasNext && !loadingMoreBronze) {
                                handleLoadMoreBronze();
                              }
                            }}
                            disabled={loadingMoreGold || loadingMoreSilver || loadingMoreBronze}
                            variant="outline"
                            className="border-primary text-primary hover:bg-primary/5"
                          >
                            {loadingMoreGold || loadingMoreSilver || loadingMoreBronze ? (
                              <span className="flex items-center gap-2">
                                <LoadingSpinner size="sm" />
                                Loading...
                              </span>
                            ) : (
                              `Load More Results`
                            )}
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <Tabs
                  value={activeTab}
                  onValueChange={(value) => setActiveTab(value as 'gold' | 'silver' | 'bronze')}
                  className="w-full"
                >
                  <TabsList className="grid w-full max-w-md grid-cols-3">
                    <TabsTrigger value="gold" className="flex items-center gap-2">
                      <span className="text-yellow-500">🥇</span>
                      Gold
                    </TabsTrigger>
                    <TabsTrigger value="silver" className="flex items-center gap-2">
                      <span className="text-gray-400">🥈</span>
                      Silver
                    </TabsTrigger>
                    <TabsTrigger value="bronze" className="flex items-center gap-2">
                      <span className="text-amber-700">🥉</span>
                      Bronze
                    </TabsTrigger>
                  </TabsList>

                  {/* Gold Tier Tab */}
                  <TabsContent value="gold" className="mt-6 space-y-4">
                    {loadingGold && goldFreelancers.length === 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <ExpertCardSkeleton key={`gold-skeleton-${i}`} />
                        ))}
                      </div>
                    ) : goldFreelancers.length > 0 ? (
                      <>
                        <ExpertList experts={goldFreelancers} />
                        {goldPagination?.hasNext && (
                          <div className="flex justify-center mt-6">
                            <Button
                              onClick={handleLoadMoreGold}
                              disabled={loadingMoreGold}
                              variant="outline"
                              className="border-primary text-primary hover:bg-primary/5"
                            >
                              {loadingMoreGold ? (
                                <span className="flex items-center gap-2">
                                  <LoadingSpinner size="sm" />
                                  Loading...
                                </span>
                              ) : (
                                `Load More Gold (${
                                  (goldPagination.total || 0) - goldFreelancers.length
                                } remaining)`
                              )}
                            </Button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-sm text-muted-foreground">
                          No Gold freelancers available
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Silver Tier Tab */}
                  <TabsContent value="silver" className="mt-6 space-y-4">
                    {loadingSilver && silverFreelancers.length === 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <ExpertCardSkeleton key={`silver-skeleton-${i}`} />
                        ))}
                      </div>
                    ) : silverFreelancers.length > 0 ? (
                      <>
                        <ExpertList experts={silverFreelancers} />
                        {silverPagination?.hasNext && (
                          <div className="flex justify-center mt-6">
                            <Button
                              onClick={handleLoadMoreSilver}
                              disabled={loadingMoreSilver}
                              variant="outline"
                              className="border-primary text-primary hover:bg-primary/5"
                            >
                              {loadingMoreSilver ? (
                                <span className="flex items-center gap-2">
                                  <LoadingSpinner size="sm" />
                                  Loading...
                                </span>
                              ) : (
                                `Load More Silver (${
                                  (silverPagination.total || 0) - silverFreelancers.length
                                } remaining)`
                              )}
                            </Button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-sm text-muted-foreground">
                          No Silver freelancers available
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Bronze Tier Tab */}
                  <TabsContent value="bronze" className="mt-6 space-y-4">
                    {loadingBronze && bronzeFreelancers.length === 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <ExpertCardSkeleton key={`bronze-skeleton-${i}`} />
                        ))}
                      </div>
                    ) : bronzeFreelancers.length > 0 ? (
                      <>
                        <ExpertList experts={bronzeFreelancers} />
                        {bronzePagination?.hasNext && (
                          <div className="flex justify-center mt-6">
                            <Button
                              onClick={handleLoadMoreBronze}
                              disabled={loadingMoreBronze}
                              variant="outline"
                              className="border-primary text-primary hover:bg-primary/5"
                            >
                              {loadingMoreBronze ? (
                                <span className="flex items-center gap-2">
                                  <LoadingSpinner size="sm" />
                                  Loading...
                                </span>
                              ) : (
                                `Load More Bronze (${
                                  (bronzePagination.total || 0) - bronzeFreelancers.length
                                } remaining)`
                              )}
                            </Button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-sm text-muted-foreground">
                          No Bronze freelancers available
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardPageWrapper>
  );
};

export default UserOverview;
