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
import type { ConsentStatus, ConsentType, ConsentUpdateRequest } from '@/types/consent';
import { getRequiredConsentsForRole } from '@/types/consent';

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
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const consents: ConsentStatus[] = consentsData?.data?.consents || [];

  // Mutation for updating a single consent
  const updateConsentMutation = useMutation({
    mutationFn: ({ type, granted }: { type: ConsentType; granted: boolean }) =>
      updateConsent(type, granted),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['consents'] });
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to update consent');
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
    await updateConsentMutation.mutateAsync({ type, granted });
    if (granted) {
      toast.success('Consent granted successfully');
    } else {
      toast.info('Consent withdrawn');
    }
  };

  const handleUpdateMultipleConsents = async (updates: ConsentUpdateRequest[]): Promise<void> => {
    await updateMultipleConsentsMutation.mutateAsync(updates);
    toast.success('Consents updated successfully');
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
