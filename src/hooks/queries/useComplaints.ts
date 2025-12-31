import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import adminComplaintService, { ComplaintListResponse } from '@/services/adminComplaintService';
import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import { getApiErrorMessage } from '@/types/common';
import { Complaint, ComplaintStatus, CreateComplaintDto } from '@/types/types';

/**
 * Hook to fetch my complaints
 */
export const useMyComplaints = (filters?: { status?: string }) => {
  return useQuery({
    queryKey: ['complaints', 'my', filters],
    queryFn: async () => {
      const queryParams = filters?.status ? `?status=${filters.status}` : '';
      const response = await api.get(`${ENDPOINTS.complaint.myComplaints}${queryParams}`);
      return response.data.data as Complaint[];
    },
  });
};

/**
 * Hook to fetch complaints against me
 */
export const useComplaintsAgainstMe = (filters?: { status?: string }) => {
  return useQuery({
    queryKey: ['complaints', 'against-me', filters],
    queryFn: async () => {
      const queryParams = filters?.status ? `?status=${filters.status}` : '';
      const response = await api.get(`${ENDPOINTS.complaint.againstMe}${queryParams}`);
      return response.data.data as Complaint[];
    },
  });
};

/**
 * Hook to fetch complaint details
 */
export const useComplaint = (complaintId: string | null) => {
  return useQuery({
    queryKey: ['complaint', complaintId],
    queryFn: async () => {
      const response = await api.get(ENDPOINTS.complaint.detail(complaintId!));
      return response.data.data as Complaint;
    },
    enabled: !!complaintId,
  });
};

/**
 * Hook to create a complaint
 */
export const useCreateComplaint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateComplaintDto) => api.post(ENDPOINTS.complaint.create, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      toast.success('Complaint submitted successfully!');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to create complaint');
    },
  });
};

// Admin Complaints
export const useAdminComplaints = (params?: {
  page?: number;
  limit?: number;
  name?: string;
  status?: ComplaintStatus;
}) => {
  return useQuery({
    queryKey: ['adminComplaints', params],
    queryFn: async () => {
      const paginationParams = {
        page: params?.page,
        limit: params?.limit,
        name: params?.name,
      };

      let response;
      if (!params?.status) {
        response = await adminComplaintService.getAll(paginationParams, {});
      } else {
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
            response = await adminComplaintService.getAll(paginationParams, {
              status: params.status,
            });
        }
      }

      return {
        complaints: response.data as ComplaintListResponse['data'],
        pagination: response.pagination,
      };
    },
  });
};

export const useAdminComplaintStats = () => {
  return useQuery({
    queryKey: ['adminComplaints', 'stats'],
    queryFn: () => adminComplaintService.getStatistics(),
  });
};
