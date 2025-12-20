import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import { getApiErrorMessage } from '@/types/common';
import { FirstAidCertificateInfo } from '@/types/types';
import { uploadFile } from '@/utils/fileUpload';

/**
 * Hook to upload first aid certificate
 */
export const useUploadFirstAidCertificate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const uploadResult = await uploadFile(file, {
        maxSize: 5 * 1024 * 1024,
        allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
        uploadType: 'first-aid-certificate',
      });

      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || 'Upload failed');
      }

      const response = await api.post(ENDPOINTS.certificate.upload, {
        certificateUrl: uploadResult.url,
      });

      return {
        url: uploadResult.url,
        status: response.data.data?.status || 'PENDING',
        fileId: uploadResult.fileId,
        publicId: uploadResult.publicId,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificate'] });
      queryClient.invalidateQueries({ queryKey: ['freelancerFiles'] });
      toast.success('Certificate uploaded successfully!');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to upload certificate');
    },
  });
};

/**
 * Hook to fetch first aid certificate status
 */
export const useFirstAidCertificateStatus = () => {
  return useQuery({
    queryKey: ['certificate', 'status'],
    queryFn: async () => {
      const response = await api.get(ENDPOINTS.certificate.status);
      return response.data.data as FirstAidCertificateInfo;
    },
  });
};

/**
 * Hook to delete certificate
 */
export const useDeleteCertificate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.delete('/freelancer/first-aid-certificate'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificate'] });
      queryClient.invalidateQueries({ queryKey: ['freelancerFiles'] });
      toast.success('Certificate deleted successfully!');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to delete certificate');
    },
  });
};
