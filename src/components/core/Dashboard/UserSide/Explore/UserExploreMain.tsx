'use client';

import { ArrowRight, Calendar, Heart, MessageCircle, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useAuth } from '@/redux/hooks/useAppHooks';
import {
  fetchAllFavoriteFreelancers,
  fetchExplorePatientBookings,
} from '@/redux/slices/exploreSlice';
import { fetchFreelancers } from '@/redux/slices/overviewSlice';
import { RootState } from '@/redux/store';
import { Expert } from '@/types/types';

import { DashboardPageWrapper } from '../../DashboardPageWrapper';
import DashboardWidget from '../Home/DashboardWidget';
import FavoriteTherapistCard from '../Home/FavoriteTherapistCard';
import InlineBookingModal from '../Home/InlineBookingModal';
import NextAppointmentHero from '../Home/NextAppointmentHero';
import QuickBookingWidget from '../Home/QuickBookingWidget';
import UpcomingAppointmentCard from '../Home/UpcomingAppointmentCard';

// Helper functions for data processing
const getNextUpcomingAppointment = (bookings: any[]) => {
  if (!bookings || bookings.length === 0) return null;

  const now = new Date();
  const upcomingBookings = bookings
    .filter((booking: any) => {
      if (!booking?.slot?.startTime) return false;
      const bookingDate = new Date(booking.slot.startTime);
      return bookingDate > now;
    })
    .sort((a: any, b: any) => {
      return new Date(a.slot.startTime).getTime() - new Date(b.slot.startTime).getTime();
    });

  return upcomingBookings.length > 0 ? upcomingBookings[0] : null;
};

// Map freelancer data to Expert format
const mapFreelancerToExpert = (freelancer: any): Expert => {
  // Extract services and their location types
  const services = freelancer.services || [];
  const allLocationTypes = new Set<string>();

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

  // Get primary service name
  const primaryService = services.length > 0 ? services[0]?.name : 'N/A';

  // Get location information
  const locations = freelancer.locations || [];
  const primaryLocation = locations.length > 0 ? locations[0]?.name : 'N/A';

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

const getRecommendedTherapists = (freelancers: any[], favorites: Expert[]) => {
  if (!freelancers || freelancers.length === 0) return [];

  // Map freelancers to Expert format
  const experts = freelancers.map(mapFreelancerToExpert);

  // Filter out already favorited therapists and get top-rated ones
  const favoriteIds = new Set(favorites.map((fav) => fav.id));
  const available = experts.filter((expert) => !favoriteIds.has(expert.id));

  // Sort by rating and return top 4
  return available.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 4);
};

const getUpcomingAppointments = (bookings: any[]) => {
  if (!bookings || bookings.length === 0) return [];

  const now = new Date();
  const upcomingBookings = bookings
    .filter((booking: any) => {
      if (!booking?.slot?.startTime) return false;
      const bookingDate = new Date(booking.slot.startTime);
      return bookingDate > now;
    })
    .sort((a: any, b: any) => {
      return new Date(a.slot.startTime).getTime() - new Date(b.slot.startTime).getTime();
    });

  return upcomingBookings;
};

const UserExploreMain = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const { favorites, loading, bookings, bookingsLoading } = useSelector(
    (state: RootState) => state.explore as any,
  );
  const { experts: allExperts, loading: expertsLoading } = useSelector(
    (state: RootState) => state.overview,
  );
  const [allTimeBookings, setAllTimeBookings] = useState<any[]>([]);
  const [allTimeBookingsLoading, setAllTimeBookingsLoading] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState<Expert | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Fetch all-time bookings for stats
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchAllTimeBookings = async () => {
      setAllTimeBookingsLoading(true);
      try {
        // Fetch all bookings without date parameter for stats
        const result = await dispatch(fetchExplorePatientBookings(undefined) as any);
        if (fetchExplorePatientBookings.fulfilled.match(result)) {
          setAllTimeBookings(result.payload || []);
        }
      } catch (error) {
        console.error('Error fetching all-time bookings:', error);
      } finally {
        setAllTimeBookingsLoading(false);
      }
    };

    fetchAllTimeBookings();
  }, [dispatch, isAuthenticated]);

  // Fetch favorites and experts
  useEffect(() => {
    if (!isAuthenticated) return;

    dispatch(fetchAllFavoriteFreelancers() as any);
    dispatch(fetchFreelancers({}) as any);
  }, [dispatch, isAuthenticated]);

  // Process data
  const favoritesList =
    favorites?.map((favorite: Expert) => {
      return {
        ...favorite,
        verificationStatus: favorite.verificationStatus,
      };
    }) || [];

  const nextAppointment = getNextUpcomingAppointment(allTimeBookings);
  const upcomingAppointments = getUpcomingAppointments(allTimeBookings);
  const recommendedTherapists = getRecommendedTherapists(allExperts, favoritesList);

  // Calculate stats
  const totalSessions = allTimeBookings?.length || 0;
  const upcomingSessions =
    allTimeBookings?.filter((booking: any) => {
      const bookingDate = new Date(booking.slot?.startTime);
      const now = new Date();
      return bookingDate > now;
    }).length || 0;
  const favoriteTherapists = favoritesList?.length || 0;

  // Calculate actual unread messages from others (not from user)
  const unreadMessages = 0; // TODO: Implement real unread message count from API

  const handleTherapistClick = (therapist: Expert) => {
    setSelectedTherapist(therapist);
    setIsBookingModalOpen(true);
  };

  const handleBookSession = (therapist: Expert, slot: any) => {
    console.log('Booking session:', { therapist, slot });
    // TODO: Implement actual booking logic
    setIsBookingModalOpen(false);
    setSelectedTherapist(null);
  };

  if (loading || expertsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <DashboardPageWrapper
      userRole="PATIENT"
      header={
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome! 👋</h1>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Dashboard Grid - Stats at Top */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardWidget
            icon={Calendar}
            title="My Bookings"
            value={upcomingSessions}
            href="/dashboard/my-bookings"
          />
          <DashboardWidget
            icon={MessageCircle}
            title="Messages"
            value={unreadMessages}
            href="/dashboard/messages"
          />
          <DashboardWidget
            icon={Heart}
            title="Favorites"
            value={favoriteTherapists}
            href="/dashboard/favorites"
          />
          <DashboardWidget
            icon={User}
            title="Sessions"
            value={totalSessions}
            className="cursor-default"
          />
        </div>

        {/* Next Appointment Hero - Large, Prominent */}
        <NextAppointmentHero booking={nextAppointment} loading={bookingsLoading} />

        {/* Quick Booking Widget - Unique Inline Experience */}
        <QuickBookingWidget
          therapists={recommendedTherapists}
          loading={expertsLoading}
          onTherapistClick={handleTherapistClick}
        />

        {/* Your Favorite Therapists Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Your Favorite Therapists
            </h2>
            <Button
              onClick={() => router.push('/dashboard/favorites')}
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary/80"
            >
              See All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          {favoritesList && favoritesList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoritesList.slice(0, 6).map((therapist: Expert) => (
                <FavoriteTherapistCard
                  key={therapist.id}
                  therapist={therapist}
                  onBook={handleTherapistClick}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <Heart className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No favorites yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Add therapists to favorites to see them here
              </p>
              <button
                onClick={() => router.push('/dashboard/explore')}
                className="text-primary hover:text-primary/80 font-medium"
              >
                Browse Therapists
              </button>
            </div>
          )}
        </div>

        {/* Upcoming Appointments Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Upcoming Appointments
            </h2>
            <Button
              onClick={() => router.push('/dashboard/my-bookings')}
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary/80"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          {upcomingAppointments && upcomingAppointments.length > 1 ? (
            <div className="space-y-3">
              {upcomingAppointments.slice(1, 4).map((booking: any) => (
                <UpcomingAppointmentCard key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No upcoming appointments
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Book a session to see your appointments here
              </p>
              <button
                onClick={() => router.push('/dashboard/explore')}
                className="text-primary hover:text-primary/80 font-medium"
              >
                Book a Session
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Inline Booking Modal */}
      <InlineBookingModal
        therapist={selectedTherapist}
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setSelectedTherapist(null);
        }}
        onBook={handleBookSession}
      />
    </DashboardPageWrapper>
  );
};

export default UserExploreMain;
