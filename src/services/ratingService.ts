import api from '@/services/api';
import {
  ApiResponse,
  CreateRatingDto,
  FreelancerRatingsResponse,
  MyRatingsResponse,
  Rating,
  RatingEligibility,
} from '@/types/types';

export const createRating = async (data: CreateRatingDto): Promise<ApiResponse<Rating>> => {
  const response = await api.post('/ratings', data);
  return response.data;
};

export const getFreelancerRatings = async (
  freelancerId: string,
  params?: {
    page?: number;
    limit?: number;
    minRating?: number;
    maxRating?: number;
  },
): Promise<FreelancerRatingsResponse> => {
  const response = await api.get(`/ratings/freelancer/${freelancerId}`, { params });
  return response.data;
};

export const checkRatingEligibility = async (bookingId: string): Promise<RatingEligibility> => {
  const response = await api.get(`/ratings/booking/${bookingId}`);
  return response.data;
};

export const getMyRatings = async (params?: {
  page?: number;
  limit?: number;
  minRating?: number;
  maxRating?: number;
}): Promise<MyRatingsResponse> => {
  const response = await api.get('/ratings/my-ratings', { params });
  return response.data;
};
