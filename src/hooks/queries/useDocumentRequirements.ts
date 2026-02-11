import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import documentRequirementService, {
  CreateDocumentRequirementDto,
  UpdateDocumentRequirementDto,
} from '@/services/documentRequirementService';
import { getApiErrorMessage } from '@/types/common';

// Query keys
const QUERY_KEYS = {
  all: ['documentRequirements'] as const,
  lists: () => [...QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...QUERY_KEYS.lists(), { filters }] as const,
  byJobTitle: (jobTitleId: string) => [...QUERY_KEYS.all, 'byJobTitle', jobTitleId] as const,
  details: () => [...QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...QUERY_KEYS.details(), id] as const,
  myStatus: () => [...QUERY_KEYS.all, 'myStatus'] as const,
  canCreateSlots: () => [...QUERY_KEYS.all, 'canCreateSlots'] as const,
};

// Admin hooks

/**
 * Get all document requirements grouped by job title
 */
export const useDocumentRequirements = () => {
  return useQuery({
    queryKey: QUERY_KEYS.lists(),
    queryFn: () => documentRequirementService.getAll(),
    select: (data) => data.data,
  });
};

/**
 * Get document requirements for a specific job title
 */
export const useDocumentRequirementsByJobTitle = (jobTitleId: string | null) => {
  return useQuery({
    queryKey: QUERY_KEYS.byJobTitle(jobTitleId || ''),
    queryFn: () => documentRequirementService.getByJobTitle(jobTitleId!),
    select: (data) => data.data,
    enabled: !!jobTitleId,
  });
};

/**
 * Get a single document requirement by ID
 */
export const useDocumentRequirement = (id: string | null) => {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id || ''),
    queryFn: () => documentRequirementService.getById(id!),
    select: (data) => data.data,
    enabled: !!id,
  });
};

/**
 * Create a new document requirement
 */
export const useCreateDocumentRequirement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDocumentRequirementDto) => documentRequirementService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('Document requirement created successfully');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to create document requirement');
    },
  });
};

/**
 * Update a document requirement
 */
export const useUpdateDocumentRequirement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDocumentRequirementDto }) =>
      documentRequirementService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('Document requirement updated successfully');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to update document requirement');
    },
  });
};

/**
 * Delete a document requirement
 */
export const useDeleteDocumentRequirement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => documentRequirementService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('Document requirement deleted successfully');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to delete document requirement');
    },
  });
};

// Admin hooks (per-freelancer)

/**
 * Get document requirements status for a specific freelancer (Admin)
 */
export const useAdminFreelancerRequirementsStatus = (freelancerId: string | null) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.all, 'adminFreelancerStatus', freelancerId] as const,
    queryFn: () => documentRequirementService.getFreelancerStatus(freelancerId!),
    select: (data) => data.data,
    enabled: !!freelancerId,
  });
};

// Freelancer hooks

/**
 * Get document requirements status for the authenticated freelancer
 */
export const useMyDocumentRequirementsStatus = () => {
  return useQuery({
    queryKey: QUERY_KEYS.myStatus(),
    queryFn: () => documentRequirementService.getMyStatus(),
    select: (data) => data.data,
  });
};

/**
 * Check if freelancer can create slots (all mandatory documents uploaded)
 */
export const useCanCreateSlots = () => {
  return useQuery({
    queryKey: QUERY_KEYS.canCreateSlots(),
    queryFn: () => documentRequirementService.canCreateSlots(),
  });
};
