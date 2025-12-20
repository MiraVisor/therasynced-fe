import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import adminJobTitleService, {
  CreateJobTitleDto,
  UpdateJobTitleDto,
} from '@/services/adminJobTitleService';
import adminServiceCategoryService, {
  CreateServiceCategoryDto,
  UpdateServiceCategoryDto,
} from '@/services/adminServiceCategoryService';
import { stampConfigService } from '@/services/stampService';
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
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create job title');
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
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update job title');
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
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create service category');
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
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update service category');
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
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to bulk update configurations');
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
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update configuration');
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
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete configuration');
    },
  });
};
