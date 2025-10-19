'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import LoadingSpinner from '@/components/ui/loading-spinner';
import { useAuth } from '@/redux/hooks/useAppHooks';
import { fetchAllFavoriteFreelancers } from '@/redux/slices/exploreSlice';
import { RootState } from '@/redux/store';
import { Expert } from '@/types/types';

import { DashboardPageWrapper } from '../../../components/core/Dashboard/DashboardPageWrapper';
import ExpertCard from '../../../components/core/Dashboard/UserSide/Overview/ExpertCard';

// Map freelancer data to Expert format (same as in UserExploreMain)
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

const FavoritesPage = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const { favorites, loading } = useSelector((state: RootState) => state.explore as any);

  useEffect(() => {
    if (!isAuthenticated) return;
    dispatch(fetchAllFavoriteFreelancers() as any);
  }, [dispatch, isAuthenticated]);

  // Process favorites data - map through the same function as experts
  const favoritesList = favorites?.map((favorite: any) => mapFreelancerToExpert(favorite)) || [];

  if (loading) {
    return (
      <DashboardPageWrapper
        userRole="PATIENT"
        header={
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Favorites</h1>
            <p className="text-gray-600 dark:text-gray-400">Your saved freelancers</p>
          </div>
        }
      >
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </DashboardPageWrapper>
    );
  }

  return (
    <DashboardPageWrapper
      userRole="PATIENT"
      header={
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Favorites</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {favoritesList.length === 0
              ? 'No favorites yet'
              : `${favoritesList.length} saved freelancer${favoritesList.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      }
    >
      {favoritesList.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <span className="text-3xl">❤️</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No favorites yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
            Start exploring freelancers and add them to your favorites to see them here.
          </p>
          <a
            href="/dashboard/explore"
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Explore Freelancers
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoritesList.map((freelancer: Expert) => (
            <ExpertCard key={freelancer.id} {...freelancer} showFavoriteText={false} />
          ))}
        </div>
      )}
    </DashboardPageWrapper>
  );
};

export default FavoritesPage;
