/**
 * Rating-related types
 */

/**
 * Base rating object structure
 */
export interface Rating {
  id: string;
  bookingId: string;
  freelancerId: string;
  patientId: string;
  rating: number; // 1-5 stars
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

/**
 * Rating with patient information (used in freelancer ratings list)
 */
export interface RatingWithPatient extends Rating {
  patient: {
    id: string;
    name: string;
    email: string;
  };
  booking?: {
    id: string;
    slotId: string;
    status: string;
  };
}

/**
 * Rating with freelancer information (used in patient's ratings list)
 */
export interface RatingWithFreelancer extends Rating {
  freelancer: {
    id: string;
    name: string;
    email: string;
  };
  booking?: {
    id: string;
    slotId: string;
    status: string;
  };
}

/**
 * Legacy alias for RatingWithPatient (for backward compatibility)
 * @deprecated Use RatingWithPatient instead
 */
export interface RatingWithDetails extends RatingWithPatient {}

// ============================================
// Booking Rating Types
// ============================================

/**
 * Rating object as it appears in booking responses
 * (from /api/v1/booking/patient/all and /api/v1/slot/list)
 */
export interface BookingRating extends Rating {
  // Same as base Rating - no additional fields
}

/**
 * Booking rating eligibility response
 * (from GET /api/v1/ratings/booking/:bookingId)
 */
export interface BookingRatingEligibility {
  canBeRated: boolean;
  hasRating: boolean;
  rating: BookingRating | null;
  reason: string | null; // Reason why it can't be rated (if applicable)
}

/**
 * Legacy alias for BookingRatingEligibility (for backward compatibility)
 * @deprecated Use BookingRatingEligibility instead
 */
export interface RatingEligibility extends BookingRatingEligibility {}

/**
 * Create rating request
 * (for POST /api/v1/ratings)
 */
export interface CreateRatingRequest {
  bookingId: string;
  rating: number; // 1-5
}

/**
 * Legacy alias for CreateRatingRequest (for backward compatibility)
 * @deprecated Use CreateRatingRequest instead
 */
export interface CreateRatingDto extends CreateRatingRequest {}

/**
 * Create rating response
 * (from POST /api/v1/ratings)
 */
export interface CreateRatingResponse {
  success: true;
  message: 'Rating submitted successfully';
  data: Rating;
}

/**
 * Legacy alias for CreateRatingResponse (for backward compatibility)
 * @deprecated Use CreateRatingResponse instead
 */
export interface RatingResponse extends CreateRatingResponse {}

// ============================================
// Freelancer Rating Types
// ============================================

/**
 * Freelancer rating summary (used in freelancer card/list responses)
 * (from /api/v1/freelancer/search, /api/v1/freelancer/all, etc.)
 */
export interface FreelancerRatingSummary {
  averageRating: number | null; // Overall average rating (1-5)
  totalRatings: number; // Total number of ratings received
}

/**
 * Freelancer ratings list response
 * (from GET /api/v1/ratings/freelancer/:freelancerId)
 */
export interface FreelancerRatingsResponse {
  data: RatingWithPatient[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Patient's ratings list response
 * (from GET /api/v1/ratings/my-ratings)
 */
export interface MyRatingsResponse {
  data: RatingWithFreelancer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ============================================
// API Query Parameters
// ============================================

/**
 * Query parameters for getting ratings
 */
export interface GetRatingsQuery {
  page?: number;
  limit?: number;
  minRating?: number; // Filter by minimum rating (1-5)
  maxRating?: number; // Filter by maximum rating (1-5)
}

/**
 * Legacy alias for GetRatingsQuery (for backward compatibility)
 * @deprecated Use GetRatingsQuery instead
 */
export interface GetRatingsParams extends GetRatingsQuery {}

// ============================================
// Type Guards & Helpers
// ============================================

/**
 * Type guard to check if a rating exists
 */
export function hasRating(rating: BookingRating | null | undefined): rating is BookingRating {
  return rating !== null && rating !== undefined;
}

/**
 * Type guard to check if freelancer has ratings
 */
export function hasFreelancerRatings(
  summary: FreelancerRatingSummary,
): summary is Required<FreelancerRatingSummary> {
  return summary.averageRating !== null && summary.totalRatings > 0;
}

/**
 * Helper to format rating display
 */
export function formatRating(rating: number | null | undefined): string {
  if (rating === null || rating === undefined) {
    return 'No ratings';
  }
  return `${rating.toFixed(1)} ⭐`;
}

/**
 * Helper to get rating percentage for display
 */
export function getRatingPercentage(rating: number | null): number {
  if (rating === null) return 0;
  return (rating / 5) * 100; // Convert 1-5 scale to 0-100%
}
