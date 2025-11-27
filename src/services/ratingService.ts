import api from './api';
import { ENDPOINTS } from './endpoints';

export interface CreateRatingDto {
  bookingId: string;
  rating: number; // 1-5 integer
}

export interface RatingResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    bookingId: string;
    freelancerId: string;
    patientId: string;
    rating: number;
    createdAt: string;
    updatedAt: string;
  };
}

export interface RatingEligibilityResponse {
  canBeRated: boolean;
  hasRating: boolean;
  rating: {
    id: string;
    rating: number;
    bookingId: string;
    freelancerId: string;
    patientId: string;
    createdAt: string;
    updatedAt: string;
  } | null;
  reason: string | null;
}

export interface FreelancerRating {
  id: string;
  bookingId: string;
  freelancerId: string;
  patientId: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
  patient: {
    id: string;
    name: string;
    email: string;
  };
  booking: {
    id: string;
    slotId: string;
    status: string;
  };
}

export interface FreelancerRatingsResponse {
  data: FreelancerRating[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface GetRatingsParams {
  page?: number;
  limit?: number;
  minRating?: number;
  maxRating?: number;
}

// Rating service
export const ratingService = {
  // Create a rating
  createRating: async (data: CreateRatingDto): Promise<RatingResponse> => {
    const response = await api.post(ENDPOINTS.ratings.create, data);
    return response.data;
  },

  // Get ratings for a freelancer
  getFreelancerRatings: async (
    freelancerId: string,
    params?: GetRatingsParams,
  ): Promise<FreelancerRatingsResponse> => {
    const response = await api.get(ENDPOINTS.ratings.getFreelancerRatings(freelancerId), {
      params,
    });
    return response.data;
  },

  // Check if booking can be rated
  checkRatingEligibility: async (bookingId: string): Promise<RatingEligibilityResponse> => {
    const response = await api.get(ENDPOINTS.ratings.checkBookingEligibility(bookingId));
    return response.data;
  },

  // Get patient's own ratings
  getMyRatings: async (params?: GetRatingsParams): Promise<FreelancerRatingsResponse> => {
    const response = await api.get(ENDPOINTS.ratings.getMyRatings, { params });
    return response.data;
  },
};

export default ratingService;
