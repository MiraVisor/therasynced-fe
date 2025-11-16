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
  // Track if a request is currently in progress
  const isRequestInProgress = useRef(false);

  const fetchVerifications = useCallback(async () => {
    // Prevent concurrent requests
    if (isRequestInProgress.current) {
      return;
    }

    try {
      isRequestInProgress.current = true;

      // Only set loading to true for subsequent loads, not initial load
      if (!isFirstLoad.current) {
        setLoading(true);
      }
      setError(null);

      const paginationParams = {
        page: params?.page,
        limit: params?.limit,
        name: params?.name,
      };

      let response: ApiResponse<PendingVerificationResponse[]>;

      // Choose the appropriate endpoint based on status
      if (!params?.status) {
        // All verifications
        response = await adminVerificationService.getAll(paginationParams);
      } else {
        // Status-specific endpoints
        switch (params.status) {
          case 'PENDING':
            response = await adminVerificationService.getPending(paginationParams);
            break;
          case 'APPROVED':
            response = await adminVerificationService.getApproved(paginationParams);
            break;
          case 'REJECTED':
            response = await adminVerificationService.getRejected(paginationParams);
            break;
          default:
            // Fallback to getAll with status filter
            response = await adminVerificationService.getAll(paginationParams);
        }
      }

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
      isRequestInProgress.current = false;
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
