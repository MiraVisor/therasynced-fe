import { useCallback, useEffect, useRef, useState } from 'react';

import adminComplaintService, { ComplaintListResponse } from '@/services/adminComplaintService';
import { ApiResponse, ComplaintStatus } from '@/types/types';

interface UseComplaintsParams {
  limit?: number;
  page?: number;
  name?: string;
  status?: ComplaintStatus;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const useComplaints = (params?: UseComplaintsParams) => {
  const [complaints, setComplaints] = useState<ComplaintListResponse['data']>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData | null>(null);

  // Track if this is the first load
  const isFirstLoad = useRef(true);

  const fetchComplaints = useCallback(async () => {
    try {
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

      let response: ApiResponse<ComplaintListResponse['data']>;

      // Choose the appropriate endpoint based on status
      if (!params?.status) {
        // All complaints
        response = await adminComplaintService.getAll(paginationParams, {});
      } else {
        // Status-specific endpoints
        switch (params.status) {
          case 'PENDING':
            response = await adminComplaintService.getPending(paginationParams);
            break;
          case 'UNDER_REVIEW':
            response = await adminComplaintService.getUnderReview(paginationParams);
            break;
          case 'RESOLVED':
            response = await adminComplaintService.getResolved(paginationParams);
            break;
          case 'DISMISSED':
            response = await adminComplaintService.getDismissed(paginationParams);
            break;
          default:
            // Fallback to getAll with status filter
            response = await adminComplaintService.getAll(
              {
                page: params?.page,
                limit: params?.limit,
                name: params?.name,
              },
              {
                status: params.status,
              },
            );
        }
      }

      if (response.success) {
        setComplaints(response.data);
        setPagination(response.pagination || null);
      } else {
        setError(response.message || 'Failed to fetch complaints');
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred while fetching complaints';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setInitialLoading(false);
      isFirstLoad.current = false;
    }
  }, [params?.page, params?.limit, params?.name, params?.status]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  return {
    complaints,
    loading,
    initialLoading,
    error,
    pagination,
    refetch: fetchComplaints,
  };
};
