import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import adminFileService from '@/services/adminFileService';
import freelancerFileService, {
  FileCategory,
  UploadFilesRequest,
} from '@/services/freelancerFileService';
import { getApiErrorMessage } from '@/types/common';

/**
 * Hook to upload multiple files with titles
 */
export const useUploadFiles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UploadFilesRequest) => {
      // Validate that files and titles count match
      if (data.files.length !== data.titles.length) {
        throw new Error('Number of files must match number of titles');
      }

      // Validate file count (1-5)
      if (data.files.length < 1 || data.files.length > 5) {
        throw new Error('You can upload between 1 and 5 files at a time');
      }

      // Validate file sizes (max 10MB each)
      const maxSize = 10 * 1024 * 1024; // 10MB
      for (const file of data.files) {
        if (file.size > maxSize) {
          throw new Error(`File ${file.name} exceeds 10MB limit`);
        }
      }

      // Validate titles are not empty
      for (const title of data.titles) {
        if (!title.trim()) {
          throw new Error('All files must have a title');
        }
      }

      // Validate category array length matches files if array is provided
      if (data.category && Array.isArray(data.category)) {
        if (data.category.length !== data.files.length) {
          throw new Error(
            'Number of categories must match number of files when using array format',
          );
        }
        // Validate each category is a valid enum value
        const validCategories: FileCategory[] = ['VERIFICATION', 'FIRST_AID_CERTIFICATE'];
        for (const category of data.category) {
          if (!validCategories.includes(category)) {
            throw new Error(
              `Invalid category: ${category}. Must be VERIFICATION or FIRST_AID_CERTIFICATE`,
            );
          }
        }
      } else if (data.category && !Array.isArray(data.category)) {
        // Validate single category is a valid enum value
        const validCategories: FileCategory[] = ['VERIFICATION', 'FIRST_AID_CERTIFICATE'];
        if (!validCategories.includes(data.category)) {
          throw new Error(
            `Invalid category: ${data.category}. Must be VERIFICATION or FIRST_AID_CERTIFICATE`,
          );
        }
      }

      return freelancerFileService.uploadFiles(data);
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['freelancerFiles'] });
      void queryClient.invalidateQueries({ queryKey: ['verification'] });
      const fileCount = data.data?.files?.length || data.data?.total || 0;
      toast.success(`Successfully uploaded ${fileCount} file(s)`);
    },
    onError: (error: unknown) => {
      const errorMessage = getApiErrorMessage(error) || 'Failed to upload files';
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to fetch files (with optional category filter)
 */
export const useFreelancerFilesList = (category?: FileCategory) => {
  return useQuery({
    queryKey: ['freelancerFiles', category],
    queryFn: () => freelancerFileService.getFiles(category),
  });
};

/**
 * Hook to download a file
 */
export const useDownloadFile = () => {
  return useMutation({
    mutationFn: async (fileId: string) => {
      const blob = await freelancerFileService.downloadFile(fileId);
      return blob;
    },
    onError: (error: unknown) => {
      const errorMessage = getApiErrorMessage(error) || 'Failed to download file';
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to get signed URL for a file
 */
export const useGetFileSignedUrl = () => {
  return useMutation({
    mutationFn: async (fileId: string) => {
      return await freelancerFileService.getFileSignedUrl(fileId);
    },
    onError: (error: unknown) => {
      const errorMessage = getApiErrorMessage(error) || 'Failed to get file URL';
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to delete a file
 */
export const useDeleteFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => freelancerFileService.deleteFile(fileId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['freelancerFiles'] });
      void queryClient.invalidateQueries({ queryKey: ['verification'] });
      toast.success('File deleted successfully');
    },
    onError: (error: unknown) => {
      const errorMessage = getApiErrorMessage(error) || 'Failed to delete file';
      toast.error(errorMessage);
    },
  });
};

/**
 * Admin hooks
 */

/**
 * Hook for admin to fetch files for review
 */
export const useAdminFilesList = (params?: { freelancerId?: string; category?: FileCategory }) => {
  return useQuery({
    queryKey: ['adminFiles', params],
    queryFn: () => adminFileService.getFiles(params),
  });
};

/**
 * Hook for admin to get file details
 */
export const useAdminFileDetails = (fileId: string) => {
  return useQuery({
    queryKey: ['adminFileDetails', fileId],
    queryFn: () => adminFileService.getFileDetails(fileId),
    enabled: !!fileId,
  });
};

/**
 * Hook for admin to download a file
 */
export const useAdminDownloadFile = () => {
  return useMutation({
    mutationFn: async (fileId: string) => {
      const blob = await adminFileService.downloadFile(fileId);
      return blob;
    },
    onError: (error: unknown) => {
      const errorMessage = getApiErrorMessage(error) || 'Failed to download file';
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook for admin to get signed URL for a file
 */
export const useAdminGetFileSignedUrl = () => {
  return useMutation({
    mutationFn: async (fileId: string) => {
      return await adminFileService.getFileSignedUrl(fileId);
    },
    onError: (error: unknown) => {
      const errorMessage = getApiErrorMessage(error) || 'Failed to get file URL';
      toast.error(errorMessage);
    },
  });
};
