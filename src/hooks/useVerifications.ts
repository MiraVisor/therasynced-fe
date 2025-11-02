import { useCallback, useEffect, useRef, useState } from 'react';

import adminVerificationService, {
  PendingVerificationResponse,
} from '@/services/adminVerificationService';
import { ApiResponse } from '@/types/types';

interface UseVerificationsParams {
  limit?: number;
  page?: number;
  name?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const useVerifications = (params?: UseVerificationsParams) => {
  const [verifications, setVerifications] = useState<PendingVerificationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData | null>(null);

  // Track if this is the first load
  const isFirstLoad = useRef(true);

  const fetchVerifications = useCallback(async () => {
    try {
      // Only set loading to true for subsequent loads, not initial load
      if (!isFirstLoad.current) {
        setLoading(true);
      }
      setError(null);

      const response: ApiResponse<PendingVerificationResponse[]> =
        await adminVerificationService.getAll(params?.status, {
          page: params?.page,
          limit: params?.limit,
          name: params?.name,
        });

      if (response.success) {
        setVerifications(response.data);
        setPagination(response.pagination || null);
      } else {
        setError(response.message || 'Failed to fetch verifications');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching verifications');
    } finally {
      setLoading(false);
      setInitialLoading(false);
      isFirstLoad.current = false;
    }
  }, [params?.page, params?.limit, params?.name, params?.status]);

  useEffect(() => {
    fetchVerifications();
  }, [fetchVerifications]);

  return {
    verifications,
    loading,
    initialLoading,
    error,
    pagination,
    refetch: fetchVerifications,
  };
};
