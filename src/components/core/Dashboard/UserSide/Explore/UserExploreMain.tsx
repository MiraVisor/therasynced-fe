'use client';

import { ArrowRight, Calendar, Heart, MessageCircle, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useExplorePatientBookings } from '@/hooks/queries/useExplore';
import { useFavoriteFreelancers, useFreelancers } from '@/hooks/queries/useFreelancers';
import { useAuth } from '@/hooks/useAuthZustand';
import type { Booking } from '@/types/booking';
import type { Expert, Freelancer } from '@/types/types';

import { DashboardPageWrapper } from '../../DashboardPageWrapper';
import DashboardWidget from '../Home/DashboardWidget';
import FavoriteFreelancerCard from '../Home/FavoriteTherapistCard';
import InlineBookingModal from '../Home/InlineBookingModal';
import NextAppointmentHero from '../Home/NextAppointmentHero';
import QuickBookingWidget from '../Home/QuickBookingWidget';
import UpcomingAppointmentCard from '../Home/UpcomingAppointmentCard';

// Helper functions for data processing
const getNextUpcomingAppointment = (bookings: Booking[]) => {
  if (!bookings || bookings.length === 0) return null;

  const now = new Date();
  const upcomingBookings = bookings
    .filter((booking: Booking) => {
      if (!booking?.slot?.startTime) return false;
      const bookingDate = new Date(booking.slot.startTime);
      return bookingDate > now;
    })
    .sort((a: Booking, b: Booking) => {
      return new Date(a.slot.startTime).getTime() - new Date(b.slot.startTime).getTime();
    });

  return upcomingBookings.length > 0 ? upcomingBookings[0] : null;
};

// Map freelancer data to Expert format
const mapFreelancerToExpert = (freelancer: Freelancer | Expert): Expert => {
  // Extract services and their location types
  const services = freelancer.services ?? [];
  const allLocationTypes = new Set<string>();

  // Convert location types to session types

  // Get primary service name
  const primaryService = services.length > 0 ? services[0]?.name : undefined;

  // Get location information
  const locations = freelancer.locations ?? [];

  // Calculate experience from creation date

  // Get rating and reviews from cardInfo
  const cardInfo = freelancer.cardInfo ?? {};
  const rating = cardInfo.averageRating ?? freelancer.averageRating;

  // Only use rating if it's a valid number greater than 0
  const validRating = rating && rating > 0 ? rating : undefined;

  // Map API freelancer to Expert type for UI
  return {
    id: freelancer.id,
    name: freelancer.name ?? cardInfo.name,
    specialty: cardInfo.mainService ?? primaryService,
    jobTitle: freelancer.mainJobTitle, // Add job title mapping
    rating: validRating,
    reviews: cardInfo.totalRatings ?? freelancer.cardInfo?.patientStories ?? 0,
    description: freelancer.description ?? cardInfo.title,
    isFavorite: freelancer.isFavorite ?? false,
    profilePicture: freelancer.profilePicture,
    slots: freelancer.slots ?? [],
    slotSummary: freelancer.slotSummary ?? {},
    cardInfo: cardInfo,
    availableSlots: freelancer.slotSummary?.availableSlots ?? 0,
    totalSlots: freelancer.slotSummary?.totalSlots ?? 0,
    planFeatures: freelancer.planFeatures ?? null,
    tier: freelancer.planFeatures?.planType ?? null,
    subscriptionStatus: freelancer.subscriptionStatus ?? undefined,
  };
};

const getRecommendedFreelancers = (freelancers: Freelancer[], favorites: Expert[]) => {
  if (!freelancers || freelancers.length === 0) return [];

  // Map freelancers to Expert format
  const experts = freelancers.map(mapFreelancerToExpert);

  // Filter out already favorited freelancers and get top-rated ones
  const favoriteIds = new Set(favorites.map((fav) => fav.id));
  const available = experts.filter((expert) => !favoriteIds.has(expert.id));

  // Sort by rating and return top 4
  return available.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 4);
};

const getUpcomingAppointments = (bookings: Booking[]) => {
  if (!bookings || bookings.length === 0) return [];

  const now = new Date();
  const upcomingBookings = bookings
    .filter((booking: Booking) => {
      if (!booking?.slot?.startTime) return false;
      const bookingDate = new Date(booking.slot.startTime);
      return bookingDate > now;
    })
    .sort((a: Booking, b: Booking) => {
      return new Date(a.slot.startTime).getTime() - new Date(b.slot.startTime).getTime();
    });

  return upcomingBookings;
};

const UserExploreMain = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [selectedFreelancer, setSelectedFreelancer] = useState<Expert | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Use React Query hooks
  const { data: allExperts = [], isLoading: expertsLoading } = useFreelancers();
  const { data: favorites = [], isLoading: favoritesLoading } = useFavoriteFreelancers();
  const { data: bookings = [], isLoading: bookingsLoading } = useExplorePatientBookings();

  // Process data - map favorites through the same function as experts
  const favoritesList =
    favorites?.map((favorite: Freelancer | Expert) => mapFreelancerToExpert(favorite)) ?? [];

  const allTimeBookings = bookings ?? [];
  const loading = expertsLoading || favoritesLoading;
  const nextAppointment = getNextUpcomingAppointment(allTimeBookings);
  const upcomingAppointments = getUpcomingAppointments(allTimeBookings);
  const recommendedFreelancers = getRecommendedFreelancers(allExperts, favoritesList);

  // Calculate stats
  const totalSessions = allTimeBookings?.length ?? 0;
  const upcomingSessions =
    allTimeBookings?.filter((booking: Booking) => {
      const bookingDate = new Date(booking.slot?.startTime);
      const now = new Date();
      return bookingDate > now;
    }).length ?? 0;
  const favoriteFreelancers = favoritesList?.length ?? 0;

  // Calculate actual unread messages from others (not from user)
  const unreadMessages = 0; // TODO: Implement real unread message count from API

  const handleFreelancerClick = (freelancer: Expert) => {
    setSelectedFreelancer(freelancer);
    setIsBookingModalOpen(true);
  };

  const handleBookSession = () => {
    // TODO: Implement actual booking logic
    setIsBookingModalOpen(false);
    setSelectedFreelancer(null);
  };

  if (loading) {
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
            value={favoriteFreelancers}
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
          freelancers={recommendedFreelancers}
          loading={expertsLoading}
          onFreelancerClick={handleFreelancerClick}
        />

        {/* Your Favorite Therapists Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-poppins font-semibold text-gray-900 dark:text-white">
              Your Favorite Freelancers
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
              {favoritesList.slice(0, 6).map((freelancer: Expert) => (
                <FavoriteFreelancerCard
                  key={freelancer.id}
                  freelancer={freelancer}
                  onBook={handleFreelancerClick}
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
                Add freelancers to favorites to see them here
              </p>
              <button
                onClick={() => router.push('/dashboard/explore')}
                className="text-primary hover:text-primary/80 font-medium"
              >
                Browse Freelancers
              </button>
            </div>
          )}
        </div>

        {/* Upcoming Appointments Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-poppins font-semibold text-gray-900 dark:text-white">
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
              {upcomingAppointments.slice(1, 4).map((booking: Booking) => (
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
        freelancer={selectedFreelancer}
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setSelectedFreelancer(null);
        }}
        onBook={handleBookSession}
      />
    </DashboardPageWrapper>
  );
};

export default UserExploreMain;
