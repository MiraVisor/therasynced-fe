import api from './api';
import { ENDPOINTS } from './endpoints';

// Types

// API Functions
export const freelancerService = {
  // Get all freelancers (future slots only)
  getAllFreelancers: async (params?: { limit?: number; page?: number }) => {
    const response = await api.get(ENDPOINTS.freelancer.all, { params });
    return response.data;
  },

  // Favorite/unfavorite a freelancer
  toggleFavorite: async (freelancerId: string) => {
    const response = await api.post(ENDPOINTS.freelancer.favorite, { freelancerId });
    return response.data;
  },

  // Get all favorite freelancers
  getFavoriteFreelancers: async () => {
    const response = await api.get(ENDPOINTS.freelancer.favoriteAll);
    return response.data;
  },

  // Get most recent favorite freelancer
  getRecentFavoriteFreelancer: async () => {
    const response = await api.get(ENDPOINTS.freelancer.recentFavorite);
    return response.data;
  },
};

export default freelancerService;
