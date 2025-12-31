import { useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';

import { EnhancedStatCard } from '@/components/ui/enhanced-stat-card';
import { usePatientBookingStats } from '@/hooks/queries/useBookings';
import { useFavoriteFreelancers } from '@/hooks/queries/useFreelancers';
import { useMyRatings } from '@/hooks/queries/useRatings';

const Stats = () => {
  const {
    data: bookingStats,
    isLoading: isLoadingBookings,
    error: bookingsError,
  } = usePatientBookingStats();
  const {
    data: favorites = [],
    isLoading: isLoadingFavorites,
    error: favoritesError,
  } = useFavoriteFreelancers();
  const {
    data: myRatingsData,
    isLoading: isLoadingRatings,
    error: ratingsError,
  } = useMyRatings({
    limit: 100, // Get enough to calculate average
  });

  // Show error toast only when no cached data exists
  useEffect(() => {
    if (bookingsError && !bookingStats) {
      const errorMessage =
        bookingsError instanceof Error ? bookingsError.message : 'Failed to load booking stats';
      toast.error(errorMessage);
    }
  }, [bookingsError, bookingStats]);

  useEffect(() => {
    if (favoritesError && favorites.length === 0) {
      const errorMessage =
        favoritesError instanceof Error ? favoritesError.message : 'Failed to load favorites';
      toast.error(errorMessage);
    }
  }, [favoritesError, favorites]);

  useEffect(() => {
    if (ratingsError && !myRatingsData) {
      const errorMessage =
        ratingsError instanceof Error ? ratingsError.message : 'Failed to load ratings';
      toast.error(errorMessage);
    }
  }, [ratingsError, myRatingsData]);

  // Calculate average rating given
  const averageRating = useMemo(() => {
    if (!myRatingsData?.data || myRatingsData.data.length === 0) return 0;
    const ratings = myRatingsData.data;
    const sum = ratings.reduce((acc, rating) => acc + (rating.rating || 0), 0);
    return sum / ratings.length;
  }, [myRatingsData]);

  const statsCards = [
    {
      title: 'Total Sessions',
      value: (bookingStats?.totalBookings || 0).toString(),
      loading: isLoadingBookings && !bookingStats,
    },
    {
      title: 'Upcoming Bookings',
      value: (bookingStats?.upcomingBookings || 0).toString(),
      loading: isLoadingBookings && !bookingStats,
    },
    {
      title: 'Favorite Freelancers',
      value: favorites.length.toString(),
      loading: isLoadingFavorites && favorites.length === 0,
    },
    {
      title: 'Avg Rating Given',
      value: averageRating > 0 ? averageRating.toFixed(1) : '0.0',
      loading: isLoadingRatings && !myRatingsData,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
      {statsCards.map((card, index) => {
        return (
          <EnhancedStatCard
            key={index}
            title={card.title}
            value={card.value}
            loading={card.loading}
            interactive
            onClick={() => {
              // Navigate to details or show modal
            }}
          />
        );
      })}
    </div>
  );
};

export default Stats;
