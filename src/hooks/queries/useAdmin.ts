import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import adminBookingsService from '@/services/adminBookingsService';
import adminFinanceService from '@/services/adminFinanceService';
import adminJobTitleService, {
  CreateJobTitleDto,
  UpdateJobTitleDto,
} from '@/services/adminJobTitleService';
import adminServiceCategoryService, {
  CreateServiceCategoryDto,
  UpdateServiceCategoryDto,
} from '@/services/adminServiceCategoryService';
import adminVerificationService, {
  PendingVerificationResponse,
} from '@/services/adminVerificationService';
import { stampConfigService } from '@/services/stampService';
import { getApiErrorMessage } from '@/types/common';
import type { BulkTherapistStampConfigDto, UpdateTherapistStampConfigDto } from '@/types/types';

// Job Titles
export const useJobTitles = (params?: {
  page?: number;
  limit?: number;
  name?: string;
  isActive?: boolean;
}) => {
  return useQuery({
    queryKey: ['jobTitles', params],
    queryFn: () => adminJobTitleService.getAll(params),
  });
};

export const useJobTitlesStats = () => {
  return useQuery({
    queryKey: ['jobTitles', 'stats'],
    queryFn: () => adminJobTitleService.getStatistics(),
  });
};

export const useCreateJobTitle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateJobTitleDto) => adminJobTitleService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobTitles'] });
      toast.success('Job title created successfully');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to create job title');
    },
  });
};

export const useUpdateJobTitle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateJobTitleDto }) =>
      adminJobTitleService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobTitles'] });
      toast.success('Job title updated successfully');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to update job title');
    },
  });
};

// Service Categories
export const useServiceCategories = (params?: {
  page?: number;
  limit?: number;
  name?: string;
  isActive?: boolean;
}) => {
  return useQuery({
    queryKey: ['serviceCategories', params],
    queryFn: () => adminServiceCategoryService.getAll(params),
  });
};

export const useServiceCategoriesStats = () => {
  return useQuery({
    queryKey: ['serviceCategories', 'stats'],
    queryFn: () => adminServiceCategoryService.getStats(),
  });
};

export const useCreateServiceCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateServiceCategoryDto) => adminServiceCategoryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceCategories'] });
      toast.success('Service category created successfully');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to create service category');
    },
  });
};

export const useUpdateServiceCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateServiceCategoryDto }) =>
      adminServiceCategoryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceCategories'] });
      toast.success('Service category updated successfully');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to update service category');
    },
  });
};

// Stamp Configurations
export const useStampConfigs = () => {
  return useQuery({
    queryKey: ['stampConfigs'],
    queryFn: () => stampConfigService.getAllConfigs(),
  });
};

export const useBulkUpdateStampConfigs = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkTherapistStampConfigDto) => stampConfigService.bulkUpdateConfigs(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['stampConfigs'] });
      toast.success(`Successfully updated ${response.data.updatedCount} therapist configurations`);
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to bulk update configurations');
    },
  });
};

export const useUpdateStampConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      therapistId,
      dto,
    }: {
      therapistId: string;
      dto: UpdateTherapistStampConfigDto;
    }) => stampConfigService.updateConfig(therapistId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stampConfigs'] });
      toast.success('Configuration updated successfully');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to update configuration');
    },
  });
};

export const useDeleteStampConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (therapistId: string) => stampConfigService.deleteConfig(therapistId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stampConfigs'] });
      toast.success('Configuration deleted successfully');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to delete configuration');
    },
  });
};

// Admin Bookings
export const useAdminBookings = (params?: { page?: number; limit?: number; name?: string }) => {
  return useQuery({
    queryKey: ['adminBookings', params],
    queryFn: async () => {
      const response = await adminBookingsService.getAll({
        page: params?.page,
        limit: params?.limit,
        name: params?.name,
      });
      return {
        bookings: response.bookings,
        pagination: response.pagination,
      };
    },
  });
};

export const useAdminBookingsStats = () => {
  return useQuery({
    queryKey: ['adminBookings', 'stats'],
    queryFn: () => adminBookingsService.getStats(),
  });
};

// Admin Verifications
export const useAdminVerifications = (params?: {
  page?: number;
  limit?: number;
  name?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}) => {
  return useQuery({
    queryKey: ['adminVerifications', params],
    queryFn: async () => {
      const paginationParams = {
        page: params?.page,
        limit: params?.limit,
        name: params?.name,
      };

      let response;
      if (!params?.status) {
        response = await adminVerificationService.getAll(paginationParams);
      } else {
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
            response = await adminVerificationService.getAll(paginationParams);
        }
      }

      return {
        verifications: response.data as PendingVerificationResponse[],
        pagination: response.pagination,
      };
    },
  });
};

export const useAdminVerificationStats = () => {
  return useQuery({
    queryKey: ['adminVerifications', 'stats'],
    queryFn: () => adminVerificationService.getStatistics(),
  });
};

// Admin Finance
export const useAdminRevenue = () => {
  return useQuery({
    queryKey: ['adminFinance', 'revenue'],
    queryFn: () => adminFinanceService.getRevenue(),
  });
};

export const useAdminSubscriptions = () => {
  return useQuery({
    queryKey: ['adminFinance', 'subscriptions'],
    queryFn: () => adminFinanceService.getSubscriptions(),
  });
};
