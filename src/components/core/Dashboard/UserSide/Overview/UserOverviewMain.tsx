'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetchFreelancers } from '@/redux/slices/overviewSlice';
import { RootState } from '@/redux/store';
import { Expert } from '@/types/types';

import { DashboardPageWrapper } from '../../DashboardPageWrapper';
import { SearchBar } from '../../SearchBar';
import { ExpertList } from './ExpertSection';
import { SectionHeader } from './SectionHeader';
import { ViewMoreButton } from './ViewMoreButton';

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

  if (services.length > 0) {
    const prices = services.map((s: any) => s.additionalPrice).filter(Boolean);
    if (prices.length > 0) {
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      pricing.online = { min: minPrice, max: maxPrice };
      pricing.office = { min: minPrice + 20, max: maxPrice + 30 };
      pricing.home = { min: minPrice + 40, max: maxPrice + 60 };
    }
  }

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
  const reviews = cardInfo.patientStories || freelancer.patientStories || 0;

  // Map API freelancer to Expert type for UI
  return {
    id: freelancer.id,
    name: freelancer.name || cardInfo.name || 'Unknown',
    specialty: cardInfo.mainService || primaryService || 'Therapy',
    experience: `${yearsOfExperience}+ years`,
    rating: rating,
    description:
      freelancer.description ||
      cardInfo.title ||
      'Professional therapist dedicated to helping clients achieve mental wellness.',
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

const UserOverview = () => {
  const dispatch = useDispatch();
  const { experts, loading, error } = useSelector((state: RootState) => state.overview);
  console.log('experts', experts);
  const [displayCount] = useState(6);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    dispatch(fetchFreelancers() as any);
  }, [dispatch]);

  const mappedExperts = experts.map(mapFreelancerToExpert);
  const displayedExperts = showAll ? mappedExperts : mappedExperts.slice(0, displayCount);
  const hasMoreExperts = mappedExperts.length > displayCount;

  const handleViewMore = () => {
    setShowAll(true);
  };

  return (
    <DashboardPageWrapper
      header={
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Find Your Perfect Therapist
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Connect with qualified mental health professionals who can help you on your journey
            </p>
          </div>
          <SearchBar isLocationEnabled />
        </div>
      }
    >
      <div className="space-y-8">
        <SectionHeader totalCount={mappedExperts.length - 1} />
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg h-80"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">⚠️</div>
            <p className="text-red-500 font-medium">{error}</p>
            <p className="text-gray-600 mt-2">Please try again later</p>
          </div>
        ) : (
          <>
            <ExpertList experts={displayedExperts} />
            {hasMoreExperts && !showAll && (
              <ViewMoreButton
                onClick={handleViewMore}
                totalCount={mappedExperts.length}
                displayedCount={displayCount}
              />
            )}
          </>
        )}
      </div>
    </DashboardPageWrapper>
  );
};

export default UserOverview;
