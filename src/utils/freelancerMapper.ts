/**
 * Unified mapping function to convert Freelancer to Expert type
 * This replaces all duplicate mapFreelancerToExpert implementations across the codebase
 */
import type { CardInfo } from '@/types/common';
import type { Freelancer } from '@/types/freelancer';
import type { Expert } from '@/types/types';

/**
 * Maps a single Freelancer (or Expert) to Expert type for UI display
 * Handles all edge cases and ensures proper type safety
 */
export function mapOneFreelancerToExpert(freelancer: Freelancer | Expert): Expert {
  // Type guard: if it's already an Expert with all required fields, return as-is
  if (
    'specialty' in freelancer &&
    typeof freelancer.specialty === 'string' &&
    'description' in freelancer &&
    typeof freelancer.description === 'string' &&
    'reviews' in freelancer &&
    typeof freelancer.reviews === 'number'
  ) {
    // It's already an Expert, but ensure all fields are properly set
    return {
      ...freelancer,
      cardInfo: freelancer.cardInfo || {
        name: freelancer.name,
        totalRatings: freelancer.reviews || 0,
      },
      slotSummary:
        freelancer.slotSummary && typeof freelancer.slotSummary === 'object'
          ? freelancer.slotSummary
          : undefined,
    } as Expert;
  }

  // It's a Freelancer - map it to Expert
  const freelancerData = freelancer as Freelancer;

  // Extract services and their location types
  const services = freelancerData.services || [];
  const locations = freelancerData.locations || [];

  // Get primary service name
  const primaryService = services.length > 0 ? services[0]?.name : undefined;

  // Get primary location
  const primaryLocation = locations.length > 0 ? locations[0]?.name : undefined;

  // Convert location types to session types
  const allLocationTypes = new Set<string>();
  locations.forEach((loc) => {
    if (loc.type) {
      allLocationTypes.add(loc.type);
    }
  });

  const sessionTypes = Array.from(allLocationTypes).map((type) => {
    switch (type) {
      case 'HOME':
        return 'home';
      case 'CLINIC':
      case 'OFFICE':
        return 'clinic';
      default:
        return 'home';
    }
  });

  // Get cardInfo with proper typing (not {})
  const cardInfo: CardInfo = freelancerData.cardInfo || {
    name: freelancerData.name,
    totalRatings: 0,
  };

  // Get rating - prefer cardInfo.averageRating (calculated from API)
  const rating =
    cardInfo.averageRating !== undefined && cardInfo.averageRating !== null
      ? cardInfo.averageRating
      : undefined;

  // Only use rating if it's a valid number greater than 0
  const validRating = rating !== undefined && rating !== null && rating > 0 ? rating : undefined;

  // Get reviews count - prefer cardInfo.totalRatings
  const reviews =
    cardInfo.totalRatings !== undefined && cardInfo.totalRatings !== null
      ? cardInfo.totalRatings
      : cardInfo.patientStories || 0;

  // Get specialty - prefer cardInfo.mainService, fallback to primaryService
  const specialty = cardInfo.mainService || primaryService || 'Therapist';

  // Get description - use cardInfo.title (Freelancer doesn't have description property)
  const description = cardInfo.title || '';

  // Get name - prefer freelancer.name, fallback to cardInfo.name
  const name = freelancerData.name || cardInfo.name || 'Unknown';

  // Handle slotSummary - use undefined instead of {} when missing
  const slotSummary =
    freelancerData.slotSummary &&
    typeof freelancerData.slotSummary === 'object' &&
    'totalSlots' in freelancerData.slotSummary
      ? freelancerData.slotSummary
      : undefined;

  // Map API freelancer to Expert type for UI
  return {
    id: freelancerData.id,
    name,
    specialty,
    jobTitle: freelancerData.mainJobTitle,
    rating: validRating,
    reviews,
    description,
    isFavorite: freelancerData.isFavorite ?? false,
    profilePicture: freelancerData.profilePicture,
    services: Array.isArray(services)
      ? (services as Array<{
          id: string;
          name: string;
          description?: string;
          additionalPrice?: number;
          duration?: number;
        }>)
      : [],
    location: primaryLocation,
    sessionTypes: sessionTypes.length > 0 ? sessionTypes : undefined,
    email: freelancerData.email,
    gender: undefined, // Not in Freelancer type
    city: freelancerData.city,
    isEmailVerified: undefined, // Not in Freelancer type
    isActive: freelancerData.isActive,
    authProvider: undefined, // Not in Freelancer type
    verificationStatus: freelancerData.verificationStatus,
    firstAidCertificateStatus: freelancerData.firstAidCertificateStatus,
    slots: freelancerData.slots || [],
    slotSummary: slotSummary,
    favoritedBy: undefined, // Not in Freelancer type
    cardInfo: cardInfo,
    availableSlots: slotSummary?.availableSlots ?? 0,
    totalSlots: slotSummary?.totalSlots ?? 0,
    planFeatures: freelancerData.planFeatures ?? null,
    tier: freelancerData.planFeatures?.planType ?? null,
    subscriptionStatus: undefined, // Not in Freelancer type, will be populated from Expert if already an Expert
    stampInfo: null, // Not in Freelancer type, will be populated from Expert if already an Expert
  };
}
