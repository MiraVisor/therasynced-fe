import { useCallback, useEffect, useState } from 'react';

import freelancerService, { Freelancer } from '@/services/freelancerService';

export const useFreelancers = (params?: { limit?: number; page?: number }) => {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFreelancers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await freelancerService.getAllFreelancers(params);

      if (response.success) {
        setFreelancers(response.data);
      } else {
        setError(response.message || 'Failed to fetch freelancers');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching freelancers');
    } finally {
      setLoading(false);
    }
  }, [params]);

  const toggleFavorite = useCallback(async (freelancerId: string) => {
    try {
      const response = await freelancerService.toggleFavorite(freelancerId);
      if (response.success) {
        // Update the freelancer's favorite status in the list
        setFreelancers((prev) =>
          prev.map((freelancer) =>
            freelancer.id === freelancerId
              ? { ...freelancer, isFavorite: response.data.favorited }
              : freelancer,
          ),
        );
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      throw new Error(err.message || 'Failed to toggle favorite');
    }
  }, []);

  useEffect(() => {
    fetchFreelancers();
  }, [fetchFreelancers]);

  return {
    freelancers,
    loading,
    error,
    toggleFavorite,
    refetch: fetchFreelancers,
  };
};

export const useFavoriteFreelancers = () => {
  const [favoriteFreelancers, setFavoriteFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavoriteFreelancers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await freelancerService.getFavoriteFreelancers();
      if (response.success) {
        setFavoriteFreelancers(response.data);
      } else {
        setError(response.message || 'Failed to fetch favorite freelancers');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching favorite freelancers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavoriteFreelancers();
  }, [fetchFavoriteFreelancers]);

  return {
    favoriteFreelancers,
    loading,
    error,
    refetch: fetchFavoriteFreelancers,
  };
};

export const useRecentFavoriteFreelancer = () => {
  const [recentFavorite, setRecentFavorite] = useState<Freelancer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentFavorite = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await freelancerService.getRecentFavoriteFreelancer();

      if (response.success) {
        setRecentFavorite(response.data);
      } else {
        setError(response.message || 'No recent favorite freelancer found');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching recent favorite');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentFavorite();
  }, [fetchRecentFavorite]);

  return {
    recentFavorite,
    loading,
    error,
    refetch: fetchRecentFavorite,
  };
};
