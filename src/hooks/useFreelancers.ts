import { useCallback, useEffect, useState } from 'react';

import freelancerService from '@/services/freelancerService';
import { Freelancer } from '@/types/types';

interface UseFreelancersParams {
  limit?: number;
  page?: number;
  name?: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const useFreelancers = (params?: UseFreelancersParams) => {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData | null>(null);

  const fetchFreelancers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await freelancerService.getAllFreelancers(params);

      if (response.success) {
        setFreelancers(response.data);
        setPagination(response.pagination);
      } else {
        setError(response.message || 'Failed to fetch freelancers');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching freelancers');
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [params?.page, params?.limit, params?.name]);

  const toggleFavorite = useCallback(async (freelancerId: string) => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFreelancers();
  }, [fetchFreelancers]);

  return {
    freelancers,
    loading,
    initialLoading,
    error,
    pagination,
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
