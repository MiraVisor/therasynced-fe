import api from './api';
import { ENDPOINTS } from './endpoints';
import { FileCategory, FileMetadata } from './freelancerFileService';

export interface AdminFileListParams {
  freelancerId?: string;
  category?: FileCategory;
}

const adminFileService = {
  /**
   * Get files for review (with optional filters)
   */
  getFiles: async (params?: AdminFileListParams): Promise<FileMetadata[]> => {
    const response = await api.get(ENDPOINTS.admin.verification.filesList, { params });
    return response.data.data || response.data;
  },

  /**
   * Get file details
   */
  getFileDetails: async (fileId: string): Promise<FileMetadata> => {
    const response = await api.get(ENDPOINTS.admin.verification.fileDetails(fileId));
    return response.data.data || response.data;
  },

  /**
   * Download a file
   */
  downloadFile: async (fileId: string): Promise<Blob> => {
    const response = await api.get(ENDPOINTS.admin.verification.fileDownload(fileId), {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Get signed URL for a file
   */
  getFileSignedUrl: async (
    fileId: string,
  ): Promise<{ signedUrl: string; expiresIn: number; fileName: string }> => {
    const response = await api.get(ENDPOINTS.admin.verification.fileSignedUrl(fileId));
    return response.data.data || response.data;
  },
};

export default adminFileService;
