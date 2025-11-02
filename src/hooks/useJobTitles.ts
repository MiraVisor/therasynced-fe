import { useCallback, useEffect, useRef, useState } from 'react';

import adminJobTitleService, { JobTitleResponse } from '@/services/adminJobTitleService';

interface UseJobTitlesParams {
  limit?: number;
  page?: number;
  name?: string;
  isActive?: boolean;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const useJobTitles = (params?: UseJobTitlesParams) => {
  const [jobTitles, setJobTitles] = useState<JobTitleResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData | null>(null);

  const isFirstLoad = useRef(true);

  const fetchJobTitles = useCallback(async () => {
    try {
      if (!isFirstLoad.current) {
        setLoading(true);
      }
      setError(null);

      const response = await adminJobTitleService.getAll(params);

      if (response.success) {
        setJobTitles(response.data);
        setPagination(response.pagination);
      } else {
        setError(response.message || 'Failed to fetch job titles');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching job titles');
    } finally {
      setLoading(false);
      setInitialLoading(false);
      isFirstLoad.current = false;
    }
  }, [params?.page, params?.limit, params?.name, params?.isActive]);

  useEffect(() => {
    fetchJobTitles();
  }, [fetchJobTitles]);

  return {
    jobTitles,
    loading,
    initialLoading,
    error,
    pagination,
    refetch: fetchJobTitles,
  };
};
