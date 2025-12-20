import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import * as dataRightsService from '@/services/dataRightsService';
import { getApiErrorMessage, getErrorMessage } from '@/types/common';
import type {
  AdminHealthDataLogsFilters,
  BreachFilters,
  CookieConsentRequest,
  CreateBreachDto,
  DeleteAccountRequest,
  HealthDataConsentRequest,
  HealthDataLogsFilters,
  ObjectProcessingRequest,
  RestrictProcessingRequest,
  UpdateBreachStatusDto,
} from '@/types/dataRights';

// Data Rights Status
export const useDataRightsStatus = () => {
  return useQuery({
    queryKey: ['dataRights', 'status'],
    queryFn: () => dataRightsService.getDataRightsStatus(),
  });
};

// Export User Data
export const useExportUserData = () => {
  return useMutation({
    mutationFn: () => dataRightsService.exportUserData(),
    onSuccess: () => {
      toast.success('Data export initiated successfully');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to export data');
    },
  });
};

export const useExportDataPortable = () => {
  return useMutation({
    mutationFn: (format: 'json' | 'csv' = 'json') => dataRightsService.exportDataPortable(format),
    onSuccess: () => {
      toast.success('Data export initiated successfully');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to export data');
    },
  });
};

// Delete Account
export const useDeleteAccount = () => {
  return useMutation({
    mutationFn: (data?: DeleteAccountRequest) => dataRightsService.deleteAccount(data?.password),
    onSuccess: () => {
      toast.success('Account deletion initiated successfully');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to delete account');
    },
  });
};

// Restrict Processing
export const useRestrictProcessing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RestrictProcessingRequest) => dataRightsService.restrictProcessing(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['dataRights'] });
      toast.success('Processing restriction updated successfully');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to restrict processing');
    },
  });
};

// Object to Processing
export const useObjectToProcessing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ObjectProcessingRequest) => dataRightsService.objectToProcessing(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['dataRights'] });
      toast.success('Processing objection updated successfully');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to object to processing');
    },
  });
};

// Health Data Consent
export const useHealthDataConsent = (userId?: string) => {
  return useQuery({
    queryKey: ['healthDataConsent', userId],
    queryFn: () => dataRightsService.getHealthDataConsent(userId),
  });
};

export const useUpdateHealthDataConsent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: HealthDataConsentRequest) => dataRightsService.updateHealthDataConsent(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['healthDataConsent'] });
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to update consent');
    },
  });
};

// Cookie Consent
export const useStoreCookieConsent = () => {
  return useMutation({
    mutationFn: (data: CookieConsentRequest) => dataRightsService.storeCookieConsent(data),
    onError: (error: unknown) => {
      // Using logger utility would be better, but keeping console.warn for non-critical errors
      // eslint-disable-next-line no-console
      console.warn('Failed to sync cookie consent with backend:', getErrorMessage(error));
    },
  });
};

// Health Data Logs
export const useMyHealthDataLogs = (filters?: HealthDataLogsFilters) => {
  return useQuery({
    queryKey: ['healthDataLogs', 'my', filters],
    queryFn: () => dataRightsService.getMyHealthDataLogs(filters),
  });
};

export const useAllHealthDataLogs = (filters?: AdminHealthDataLogsFilters) => {
  return useQuery({
    queryKey: ['healthDataLogs', 'all', filters],
    queryFn: () => dataRightsService.getAllHealthDataLogs(filters),
  });
};

// Data Breach Management
export const useBreaches = (filters?: BreachFilters) => {
  return useQuery({
    queryKey: ['breaches', filters],
    queryFn: () => dataRightsService.getBreaches(filters),
  });
};

export const useBreachById = (id: string) => {
  return useQuery({
    queryKey: ['breach', id],
    queryFn: () => dataRightsService.getBreachById(id),
    enabled: !!id,
  });
};

export const useCreateBreach = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBreachDto) => dataRightsService.createBreach(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['breaches'] });
      toast.success('Breach created successfully');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to create breach');
    },
  });
};

export const useUpdateBreachStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBreachStatusDto }) =>
      dataRightsService.updateBreachStatus(id, data),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['breaches'] });
      void queryClient.invalidateQueries({ queryKey: ['breach', variables.id] });
      toast.success('Breach status updated successfully');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to update breach status');
    },
  });
};

export const useReportBreachToDpc = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      dataRightsService.reportBreachToDpc(id, notes),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['breaches'] });
      void queryClient.invalidateQueries({ queryKey: ['breach', variables.id] });
      toast.success('Breach marked as reported to DPC');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to mark as reported to DPC');
    },
  });
};

export const useNotifyUsersAboutBreach = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      dataRightsService.notifyUsersAboutBreach(id, notes),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['breaches'] });
      void queryClient.invalidateQueries({ queryKey: ['breach', variables.id] });
      toast.success('Users marked as notified');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to mark users as notified');
    },
  });
};
