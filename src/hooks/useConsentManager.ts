/**
 * Unified Consent Manager Hook
 *
 * This hook provides a simple interface for managing all consents.
 * It handles fetching, updating, and checking consent status.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { useAuth } from '@/hooks/useAuthZustand';
import {
  getAllConsents,
  hasConsent,
  updateConsent,
  updateMultipleConsents,
} from '@/services/consentService';
import { getApiErrorMessage } from '@/types/common';
import {
  type ConsentStatus,
  type ConsentType,
  type ConsentUpdateRequest,
  getRequiredConsentsForRole,
} from '@/types/consent';

export interface ConsentManager {
  consents: ConsentStatus[];
  isLoading: boolean;
  error: Error | null;
  updateConsent: (type: ConsentType, granted: boolean) => Promise<void>;
  updateMultipleConsents: (updates: ConsentUpdateRequest[]) => Promise<void>;
  hasConsent: (type: ConsentType) => boolean;
  getRequiredConsents: () => ConsentType[];
  checkAllRequired: () => boolean;
  refetch: () => void;
}

/**
 * Main hook for managing consents
 */
export const useConsentManager = (): ConsentManager => {
  const { role } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all consents
  const {
    data: consentsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['consents', 'all'],
    queryFn: () => getAllConsents(),
    staleTime: 10 * 60 * 1000, // 10 minutes - consider data fresh for 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache for 30 minutes
    refetchOnMount: false, // Don't refetch if data exists in cache
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: false, // Don't refetch on reconnect
    retry: 1,
  });

  // Handle both response structures: data as array or data.consents
  const consents: ConsentStatus[] = (() => {
    if (!consentsData) return [];
    // If data is directly an array
    if (Array.isArray(consentsData.data)) {
      return consentsData.data;
    }
    // If data is an object with consents property
    if (
      consentsData.data &&
      typeof consentsData.data === 'object' &&
      'consents' in consentsData.data
    ) {
      return Array.isArray(consentsData.data.consents) ? consentsData.data.consents : [];
    }
    return [];
  })();

  // Mutation for updating a single consent
  const updateConsentMutation = useMutation({
    mutationFn: ({ type, granted }: { type: ConsentType; granted: boolean }) =>
      updateConsent(type, granted),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['consents'] });
    },
    onError: (error: unknown) => {
      // Don't show error here if it's a 403 - handleUpdateConsent will show a custom message
      const apiError = error as { response?: { status?: number } };
      if (apiError.response?.status !== 403) {
        toast.error(getApiErrorMessage(error) || 'Failed to update consent');
      }
    },
  });

  // Mutation for updating multiple consents
  const updateMultipleConsentsMutation = useMutation({
    mutationFn: (updates: ConsentUpdateRequest[]) => updateMultipleConsents(updates),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['consents'] });
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to update consents');
    },
  });

  // Helper functions
  const hasConsentStatus = (type: ConsentType): boolean => {
    return hasConsent(consents, type);
  };

  const getRequiredConsentsForCurrentRole = (): ConsentType[] => {
    if (!role) return [];
    return getRequiredConsentsForRole(role as 'PATIENT' | 'FREELANCER');
  };

  const checkAllRequiredConsents = (): boolean => {
    const required = getRequiredConsentsForCurrentRole();
    return required.every((type) => hasConsentStatus(type));
  };

  const handleUpdateConsent = async (type: ConsentType, granted: boolean): Promise<void> => {
    try {
      await updateConsentMutation.mutateAsync({ type, granted });
      if (granted) {
        toast.success('Consent granted successfully');
      } else {
        toast.info('Consent withdrawn');
      }
    } catch (error: unknown) {
      // Handle 403 Forbidden for required consent withdrawal
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { status?: number; data?: { message?: string } } };
        if (apiError.response?.status === 403) {
          const errorMessage =
            apiError.response.data?.message ||
            'Required agreements cannot be withdrawn without closing the account. If you wish to withdraw this agreement, you will need to delete your account.';
          toast.error(errorMessage, {
            autoClose: 6000,
          });
          return;
        }
      }
      // Re-throw to let the mutation's onError handle it
      throw error;
    }
  };

  const handleUpdateMultipleConsents = async (updates: ConsentUpdateRequest[]): Promise<void> => {
    try {
      await updateMultipleConsentsMutation.mutateAsync(updates);
      toast.success('Consents updated successfully');
    } catch (error: unknown) {
      // Handle 403 Forbidden for required consent withdrawal
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { status?: number; data?: { message?: string } } };
        if (apiError.response?.status === 403) {
          const errorMessage =
            apiError.response.data?.message ||
            'Required agreements cannot be withdrawn without closing the account. If you wish to withdraw these agreements, you will need to delete your account.';
          toast.error(errorMessage, {
            autoClose: 6000,
          });
          return;
        }
      }
      // Re-throw to let the mutation's onError handle it
      throw error;
    }
  };

  return {
    consents,
    isLoading,
    error: error,
    updateConsent: handleUpdateConsent,
    updateMultipleConsents: handleUpdateMultipleConsents,
    hasConsent: hasConsentStatus,
    getRequiredConsents: getRequiredConsentsForCurrentRole,
    checkAllRequired: checkAllRequiredConsents,
    refetch: () => {
      void refetch();
    },
  };
};
