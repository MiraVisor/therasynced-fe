import { useCallback, useEffect, useRef, useState } from 'react';

import adminServiceCategoryService, {
  ServiceCategoryResponse,
} from '@/services/adminServiceCategoryService';
import { ApiResponse, PaginationDto } from '@/types/types';

interface UseServiceCategoriesParams extends PaginationDto {}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const useServiceCategories = (params?: UseServiceCategoriesParams) => {
  const [serviceCategories, setServiceCategories] = useState<ServiceCategoryResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData | null>(null);

  // Track if this is the first load
  const isFirstLoad = useRef(true);

  const fetchServiceCategories = useCallback(async () => {
    try {
      // Only set loading to true for subsequent loads, not initial load
      if (!isFirstLoad.current) {
        setLoading(true);
      }
      setError(null);

      const response: ApiResponse<ServiceCategoryResponse[]> =
        await adminServiceCategoryService.getAll(params);

      if (response.success) {
        setServiceCategories(response.data);
        setPagination(response.pagination || null);
      } else {
        setError(response.message || 'Failed to fetch service categories');
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred while fetching service categories';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setInitialLoading(false);
      isFirstLoad.current = false;
    }
  }, [params]);

  useEffect(() => {
    fetchServiceCategories();
  }, [fetchServiceCategories]);

  return {
    serviceCategories,
    loading,
    initialLoading,
    error,
    pagination,
    refetch: fetchServiceCategories,
  };
};
