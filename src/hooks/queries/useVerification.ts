import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import { FreelancerFile, FreelancerFilesResponse } from '@/types/types';
import { uploadFile } from '@/utils/fileUpload';

interface VerificationDocument {
  id: string;
  url: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  publicId?: string;
}

// Helper to transform backend files
const transformBackendFilesToArray = (
  backendResponse: FreelancerFilesResponse,
): FreelancerFile[] => {
  const files: FreelancerFile[] = [];

  if (backendResponse.profilePicture) {
    files.push({
      id: `profile-${Date.now()}`,
      fileName: backendResponse.profilePicture.originalName || 'Profile Picture',
      fileType: 'PROFILE_PICTURE',
      url: backendResponse.profilePicture.url,
      fileSize: backendResponse.profilePicture.fileSize,
      uploadedAt: backendResponse.profilePicture.uploadedAt,
      format: backendResponse.profilePicture.format,
    });
  }

  if (backendResponse.firstAidCertificate) {
    files.push({
      id: `certificate-${Date.now()}`,
      fileName: backendResponse.firstAidCertificate.originalName || 'First Aid Certificate',
      fileType: 'CERTIFICATE',
      url: backendResponse.firstAidCertificate.url,
      fileSize: backendResponse.firstAidCertificate.fileSize,
      uploadedAt: backendResponse.firstAidCertificate.uploadedAt,
      status: backendResponse.firstAidCertificate.status,
      format: backendResponse.firstAidCertificate.format,
      approvedAt: backendResponse.firstAidCertificate.approvedAt,
      rejectedAt: backendResponse.firstAidCertificate.rejectedAt,
      rejectionReason: backendResponse.firstAidCertificate.rejectionReason,
    });
  }

  if (backendResponse.verificationDocuments?.length) {
    backendResponse.verificationDocuments.forEach((doc, index) => {
      files.push({
        id: `verification-${index}-${Date.now()}`,
        fileName: doc.originalName || `Verification Document ${index + 1}`,
        fileType: 'VERIFICATION_DOCUMENT',
        url: doc.url,
        fileSize: doc.fileSize,
        uploadedAt: doc.uploadedAt,
        status: doc.status,
        format: doc.format,
        approvedAt: doc.approvedAt,
        rejectedAt: doc.rejectedAt,
        rejectionReason: doc.rejectionReason,
      });
    });
  }

  return files;
};

/**
 * Hook to upload verification document
 */
export const useUploadVerificationDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const uploadResult = await uploadFile(file, {
        maxSize: 5 * 1024 * 1024,
        allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
        uploadType: 'verification-document',
      });

      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || 'Upload failed');
      }

      const response = await api.post(ENDPOINTS.verification.uploadDocument, {
        documentUrl: uploadResult.url,
        fileName: file.name,
        fileSize: file.size,
      });

      return {
        id: response.data.data?.id || uploadResult.fileId,
        url: uploadResult.url,
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        publicId: uploadResult.publicId,
      } as VerificationDocument;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification'] });
      queryClient.invalidateQueries({ queryKey: ['freelancerFiles'] });
      toast.success('Document uploaded successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to upload document');
    },
  });
};

/**
 * Hook to fetch verification documents
 */
export const useVerificationDocuments = () => {
  return useQuery({
    queryKey: ['verification', 'documents'],
    queryFn: async () => {
      const response = await api.get(ENDPOINTS.verification.getDocuments);
      return response.data.data as VerificationDocument[];
    },
  });
};

/**
 * Hook to delete verification document
 */
export const useDeleteVerificationDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentUrl: string) =>
      api.delete(ENDPOINTS.verification.deleteDocument(documentUrl)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification'] });
      queryClient.invalidateQueries({ queryKey: ['freelancerFiles'] });
      toast.success('Document deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete document');
    },
  });
};

/**
 * Hook to fetch all freelancer files
 */
export const useFreelancerFiles = () => {
  return useQuery({
    queryKey: ['freelancerFiles'],
    queryFn: async () => {
      const response = await api.get(ENDPOINTS.freelancer.files);
      const backendData = response.data.data as FreelancerFilesResponse;
      return transformBackendFilesToArray(backendData);
    },
  });
};

/**
 * Hook to fetch verification status
 */
export const useVerificationStatus = () => {
  return useQuery({
    queryKey: ['verification', 'status'],
    queryFn: async () => {
      const response = await api.get(ENDPOINTS.verification.status);
      return response.data.data;
    },
  });
};

/**
 * Hook to request verification
 */
export const useRequestVerification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.post(ENDPOINTS.verification.requestVerification),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification'] });
      toast.success('Verification request submitted successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to request verification');
    },
  });
};
