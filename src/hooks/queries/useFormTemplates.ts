import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import * as formTemplateApi from '@/services/formTemplateService';
import { getApiErrorMessage } from '@/types/common';
import type { CreateFormTemplateDto, UpdateFormTemplateDto } from '@/types/formTemplate';

/**
 * Admin: Hook to fetch all form templates (visible and hidden)
 */
export const useFormTemplates = () => {
  return useQuery({
    queryKey: ['formTemplates', 'admin'],
    queryFn: () => formTemplateApi.getAllFormTemplates(),
    select: (data) => data.data,
  });
};

/**
 * Admin: Hook to fetch a single form template by ID
 */
export const useFormTemplate = (id: string | null) => {
  return useQuery({
    queryKey: ['formTemplate', id],
    queryFn: () => formTemplateApi.getFormTemplateById(id!),
    enabled: !!id,
    select: (data) => data.data,
  });
};

/**
 * Admin: Hook to upload a new form template
 */
export const useUploadFormTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      onProgress,
    }: {
      data: CreateFormTemplateDto;
      onProgress?: (progress: { loaded: number; total: number; percentage: number }) => void;
    }) => formTemplateApi.uploadFormTemplate(data, onProgress),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['formTemplates'] });
      toast.success('Form template uploaded successfully!');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to upload form template');
    },
  });
};

/**
 * Admin: Hook to update a form template
 */
export const useUpdateFormTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFormTemplateDto }) =>
      formTemplateApi.updateFormTemplate(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['formTemplates'] });
      void queryClient.invalidateQueries({ queryKey: ['formTemplate'] });
      toast.success('Form template updated successfully!');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to update form template');
    },
  });
};

/**
 * Admin: Hook to delete a form template
 */
export const useDeleteFormTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => formTemplateApi.deleteFormTemplate(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['formTemplates'] });
      toast.success('Form template deleted successfully!');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to delete form template');
    },
  });
};

/**
 * Admin: Hook to download a form template
 */
export const useDownloadFormTemplate = () => {
  return useMutation({
    mutationFn: ({ id, filename }: { id: string; filename: string }) =>
      formTemplateApi.downloadFormTemplate(id).then((blob) => {
        formTemplateApi.downloadBlob(blob, filename);
      }),
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to download form template');
    },
  });
};

/**
 * Freelancer: Hook to fetch visible form templates only
 */
export const useVisibleFormTemplates = () => {
  return useQuery({
    queryKey: ['formTemplates', 'freelancer'],
    queryFn: () => formTemplateApi.getVisibleFormTemplates(),
    select: (data) => data.data,
  });
};

/**
 * Freelancer: Hook to download a visible form template
 */
export const useDownloadFreelancerFormTemplate = () => {
  return useMutation({
    mutationFn: ({ id, filename }: { id: string; filename: string }) =>
      formTemplateApi.downloadFreelancerFormTemplate(id).then((blob) => {
        formTemplateApi.downloadBlob(blob, filename);
      }),
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to download form template');
    },
  });
};
