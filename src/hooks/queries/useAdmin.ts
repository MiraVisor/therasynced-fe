import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import adminBookingsService from '@/services/adminBookingsService';
import adminFinanceService from '@/services/adminFinanceService';
import adminFreelancerService, {
  ToggleFreelancerStatusRequest,
} from '@/services/adminFreelancerService';
import adminJobTitleService, {
  CreateJobTitleDto,
  UpdateJobTitleDto,
} from '@/services/adminJobTitleService';
import adminServiceCategoryService, {
  CreateServiceCategoryDto,
  UpdateServiceCategoryDto,
} from '@/services/adminServiceCategoryService';
import adminSubscriptionService, {
  AdminSubscriptionFilters,
  CancelSubscriptionRequest,
  TrialAccessRequest,
  UpdateSubscriptionPlanRequest,
} from '@/services/adminSubscriptionService';
import adminVerificationService, {
  PendingVerificationResponse,
} from '@/services/adminVerificationService';
import { getApiErrorMessage } from '@/types/common';

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

export const useSubscriptionMetrics = (startDate?: Date | string, endDate?: Date | string) => {
  return useQuery({
    queryKey: ['adminFinance', 'subscriptionMetrics', startDate, endDate],
    queryFn: () => adminFinanceService.getSubscriptionMetrics(startDate, endDate),
  });
};

// Admin User Subscription Management
export const useAdminUserSubscriptions = (filters?: AdminSubscriptionFilters) => {
  return useQuery({
    queryKey: ['adminUserSubscriptions', filters],
    queryFn: () => adminSubscriptionService.getAllUserSubscriptions(filters),
  });
};

export const useAdminUserSubscription = (userId: string | null) => {
  return useQuery({
    queryKey: ['adminUserSubscription', userId],
    queryFn: () => adminSubscriptionService.getUserSubscription(userId!),
    enabled: !!userId,
  });
};

export const useCancelUserSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: CancelSubscriptionRequest }) =>
      adminSubscriptionService.cancelSubscription(userId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['adminUserSubscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['adminUserSubscription'] });
      toast.success(response.message || 'Subscription canceled successfully');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to cancel subscription');
    },
  });
};

export const useUpdateUserSubscriptionPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateSubscriptionPlanRequest }) =>
      adminSubscriptionService.updateUserPlan(userId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['adminUserSubscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['adminUserSubscription'] });
      toast.success(response.message || 'Subscription plan updated successfully');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to update subscription plan');
    },
  });
};

export const useResumeUserSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => adminSubscriptionService.resumeSubscription(userId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['adminUserSubscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['adminUserSubscription'] });
      toast.success(response.message || 'Subscription resumed successfully');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to resume subscription');
    },
  });
};

export const useManageTrialAccess = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: TrialAccessRequest }) =>
      adminSubscriptionService.manageTrialAccess(userId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['adminUserSubscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['adminUserSubscription'] });
      toast.success(response.message || 'Trial access updated successfully');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to manage trial access');
    },
  });
};

// Admin Freelancer Management
export const useAdminFreelancers = (params?: { page?: number; limit?: number; name?: string }) => {
  return useQuery({
    queryKey: ['adminFreelancers', params],
    queryFn: () => adminVerificationService.getAllFreelancers(params),
    select: (data) => ({
      freelancers: data.data || data.verifications || [],
      pagination: data.pagination,
    }),
  });
};

export const useToggleFreelancerStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      freelancerId,
      data,
    }: {
      freelancerId: string;
      data: ToggleFreelancerStatusRequest;
    }) => adminFreelancerService.toggleStatus(freelancerId, data),
    onSuccess: (response) => {
      // Invalidate freelancers queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['freelancers'] });
      queryClient.invalidateQueries({ queryKey: ['adminFreelancers'] });
      queryClient.invalidateQueries({ queryKey: ['freelancerStats'] });
      toast.success(response.message || 'Freelancer status updated successfully');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to update freelancer status');
    },
  });
};
