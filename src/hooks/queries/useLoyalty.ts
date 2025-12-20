import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import {
  BulkTherapistStampConfigDto,
  CreateTherapistStampConfigDto,
  LoyaltyProfile,
  LoyaltyReward,
  Redemption,
  TherapistStampConfig,
  TherapistStampDetail,
  TherapistStampSummary,
  UpdateTherapistStampConfigDto,
} from '@/types/types';

/**
 * Hook to fetch loyalty profile
 */
export const useLoyaltyProfile = () => {
  return useQuery({
    queryKey: ['loyalty', 'profile'],
    queryFn: async () => {
      const response = await api.get(ENDPOINTS.loyalty.profile);
      return response.data.data as LoyaltyProfile;
    },
  });
};

/**
 * Hook to fetch loyalty rewards
 */
export const useLoyaltyRewards = () => {
  return useQuery({
    queryKey: ['loyalty', 'rewards'],
    queryFn: async () => {
      const response = await api.get(ENDPOINTS.loyalty.rewards);
      return response.data.data as LoyaltyReward[];
    },
  });
};

/**
 * Hook to fetch redemption history
 */
export const useRedemptionHistory = () => {
  return useQuery({
    queryKey: ['loyalty', 'redemptions'],
    queryFn: async () => {
      const response = await api.get(ENDPOINTS.loyalty.redemptions);
      return response.data.data as Redemption[];
    },
  });
};

/**
 * Hook to redeem a reward
 */
export const useRedeemReward = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rewardId: string) => api.post(ENDPOINTS.loyalty.redeem, { rewardId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty'] });
      toast.success('Reward redeemed successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to redeem reward');
    },
  });
};

// Therapist Stamp System Hooks

/**
 * Hook to fetch patient stamps
 */
export const usePatientStamps = () => {
  return useQuery({
    queryKey: ['stamps', 'patient'],
    queryFn: async () => {
      const response = await api.get(ENDPOINTS.loyalty.stamps);
      return response.data.data as TherapistStampSummary[];
    },
  });
};

/**
 * Hook to fetch stamp detail for a therapist
 */
export const useStampDetail = (therapistId: string | null) => {
  return useQuery({
    queryKey: ['stamps', 'detail', therapistId],
    queryFn: async () => {
      const response = await api.get(ENDPOINTS.loyalty.stampDetail(therapistId!));
      return response.data.data as TherapistStampDetail;
    },
    enabled: !!therapistId,
  });
};

// Admin Stamp Config Hooks

/**
 * Hook to fetch all stamp configs (admin)
 */
export const useAllStampConfigs = () => {
  return useQuery({
    queryKey: ['stamps', 'configs', 'all'],
    queryFn: async () => {
      const response = await api.get(ENDPOINTS.loyalty.stampConfig);
      return response.data.data as TherapistStampConfig[];
    },
  });
};

/**
 * Hook to fetch stamp config for a therapist (admin)
 */
export const useStampConfigByTherapist = (therapistId: string | null) => {
  return useQuery({
    queryKey: ['stamps', 'config', therapistId],
    queryFn: async () => {
      const response = await api.get(ENDPOINTS.loyalty.stampConfigByTherapist(therapistId!));
      return response.data.data as TherapistStampConfig;
    },
    enabled: !!therapistId,
  });
};

/**
 * Hook to create or update stamp config (admin)
 */
export const useCreateOrUpdateStampConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateTherapistStampConfigDto) =>
      api.post(ENDPOINTS.loyalty.stampConfig, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stamps', 'configs'] });
      toast.success('Stamp configuration saved successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to save stamp configuration');
    },
  });
};

/**
 * Hook to update stamp config (admin)
 */
export const useUpdateStampConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      therapistId,
      dto,
    }: {
      therapistId: string;
      dto: UpdateTherapistStampConfigDto;
    }) => api.patch(ENDPOINTS.loyalty.stampConfigByTherapist(therapistId), dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stamps', 'configs'] });
      toast.success('Stamp configuration updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update stamp configuration');
    },
  });
};

/**
 * Hook to delete stamp config (admin)
 */
export const useDeleteStampConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (therapistId: string) =>
      api.delete(ENDPOINTS.loyalty.stampConfigByTherapist(therapistId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stamps', 'configs'] });
      toast.success('Stamp configuration deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete stamp configuration');
    },
  });
};

/**
 * Hook to bulk update stamp configs (admin)
 */
export const useBulkUpdateStampConfigs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: BulkTherapistStampConfigDto) =>
      api.post(ENDPOINTS.loyalty.stampConfigBulk, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stamps', 'configs'] });
      toast.success('Stamp configurations updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update stamp configurations');
    },
  });
};
