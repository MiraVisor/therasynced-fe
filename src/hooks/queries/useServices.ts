import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import * as serviceApi from '@/services/serviceService';
import { getApiErrorMessage } from '@/types/common';
import { CreateServiceDto, Service } from '@/types/types';

interface ServiceParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Hook to fetch services
 */
export const useServices = (params?: ServiceParams) => {
  return useQuery({
    queryKey: ['services', params],
    queryFn: () => serviceApi.getServices(params || {}),
    select: (data) => data.data as Service[],
  });
};

/**
 * Hook to fetch a single service
 */
export const useService = (id: string | null) => {
  return useQuery({
    queryKey: ['service', id],
    queryFn: () => serviceApi.getServiceById(id!),
    enabled: !!id,
    select: (data) => data.data as Service,
  });
};

/**
 * Hook to fetch freelancer services
 */
export const useFreelancerServices = (freelancerId: string | null) => {
  return useQuery({
    queryKey: ['services', 'freelancer', freelancerId],
    queryFn: () => serviceApi.getFreelancerServices(freelancerId!),
    enabled: !!freelancerId,
    select: (data) => data.data as Service[],
  });
};

/**
 * Hook to create a service
 */
export const useCreateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateServiceDto) => serviceApi.createService(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service created successfully!');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to create service');
    },
  });
};

/**
 * Hook to update a service
 */
export const useUpdateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateServiceDto> }) =>
      serviceApi.updateService(id, data),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['services'] });
      void queryClient.invalidateQueries({ queryKey: ['service', variables.id] });
      toast.success('Service updated successfully!');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to update service');
    },
  });
};

/**
 * Hook to delete a service
 */
export const useDeleteService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => serviceApi.deleteService(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service deleted successfully!');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to delete service');
    },
  });
};
