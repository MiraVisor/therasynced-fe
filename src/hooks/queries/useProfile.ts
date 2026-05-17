import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import * as profileApi from '@/services/profileService';
import { useAuthStore } from '@/stores/authStore';
import { getApiErrorMessage } from '@/types/common';
import {
  BackendProfileResponse,
  ChangeEmailDto,
  ChangePasswordDto,
  FreelancerData,
  JobTitle,
  UpdateProfileDto,
} from '@/types/types';

/**
 * Hook to upload profile picture
 */
export const useUploadProfilePicture = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => profileApi.uploadProfilePicture(file),
    onSuccess: async (data) => {
      // Invalidate and refetch profile query to ensure data is up to date
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      await queryClient.refetchQueries({ queryKey: ['profile'] });
      toast.success('Profile picture uploaded successfully!');
      return data;
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to upload profile picture');
    },
  });
};

// Type for the user profile data
export interface UserProfileData {
  id: string;
  email: string;
  name: string;
  gender: string;
  profilePicture?: string;
  role: string;
  dob: string;
  county?: string | null;
  cityTown?: string | null;
  description?: string; // Bio/description field
  isEmailVerified: boolean;
  authProvider: string;
  createdAt: string;
  updatedAt: string;
  mainJobTitle?: JobTitle;
  mainJobTitleId?: string;
  clinicAddress?: string;
  homeAddress?: string; // NEW: Home address for bookings
  verificationDocuments?: string[];
  verificationRequestedAt?: Date | null;
  verificationApprovedAt?: Date | null;
  verificationRejectedAt?: Date | null;
  verificationRejectionReason?: string | null;
  firstAidCertificateUrl?: string;
  firstAidCertificateStatus?: string;
  firstAidCertificateApprovedAt?: Date | null;
  firstAidCertificateRejectedAt?: Date | null;
  firstAidCertificateRejectionReason?: string | null;
  isActive?: boolean;
}

/**
 * Hook to fetch user profile
 */
export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => profileApi.getProfile(),
    select: (data: BackendProfileResponse): UserProfileData | undefined => {
      // BackendProfileResponse has structure: { data: { user: {...} } }
      return data.data?.user as UserProfileData | undefined;
    },
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes (shorter than default)
    refetchOnMount: 'always', // Always refetch when component mounts to ensure fresh data
  });
};

/**
 * Hook to fetch freelancer data from profile
 */
export const useFreelancerData = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => profileApi.getProfile(),
    select: (data: BackendProfileResponse): FreelancerData | undefined => {
      return data.data?.freelancerData;
    },
  });
};

/**
 * Hook to update user profile
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileDto) => profileApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['documentRequirements'] });
      toast.success('Profile updated successfully!');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to update profile');
    },
  });
};

/**
 * Hook to change password
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordDto) => profileApi.changePassword(data),
    onSuccess: () => {
      toast.success('Password changed successfully!');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to change password');
    },
  });
};

/**
 * Hook to change email
 */
export const useChangeEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ChangeEmailDto) => profileApi.changeEmail(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Email change request sent! Please check your email.');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to change email');
    },
  });
};

/**
 * Hook to delete profile
 */
export const useDeleteProfile = () => {
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: () => profileApi.deleteProfile(),
    onSuccess: () => {
      queryClient.clear();
      logout();
      toast.success('Profile deleted successfully');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to delete profile');
    },
  });
};
