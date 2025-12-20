import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import { Complaint, CreateComplaintDto } from '@/types/types';

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
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create complaint');
    },
  });
};
