import api from './api';
import { ENDPOINTS } from './endpoints';

export type FileCategory = 'VERIFICATION' | 'FIRST_AID_CERTIFICATE';

export interface FileMetadata {
  id: string;
  title: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  category?: FileCategory | null;
  createdAt: string;
  updatedAt: string;
}

export interface UploadFilesRequest {
  files: File[];
  titles: string[];
  // Category can be a single value (applied to all files) or an array (one per file)
  // If not provided, files are uploaded without category (backward compatible)
  category?: FileCategory | FileCategory[];
}

export interface UploadFilesResponse {
  success: boolean;
  data: {
    files: FileMetadata[];
    total: number;
  };
  message?: string;
}

const freelancerFileService = {
  /**
   * Upload multiple files (1-5) with titles
   */
  uploadFiles: async (data: UploadFilesRequest): Promise<UploadFilesResponse> => {
    const formData = new FormData();

    // Append files
    data.files.forEach((file) => {
      formData.append('files', file);
    });

    // Append titles using bracket notation for array support
    // This creates: titles[]=Title1, titles[]=Title2, etc.
    data.titles.forEach((title) => {
      formData.append('titles[]', title);
    });

    // Append category if provided
    // Backend accepts: single value (applied to all) or array (one per file)
    if (data.category) {
      if (Array.isArray(data.category)) {
        // Array: one category per file
        data.category.forEach((category) => {
          formData.append('categories[]', category);
        });
      } else {
        // Single value: applied to all files
        formData.append('categories', data.category);
      }
    }

    const response = await api.post(ENDPOINTS.freelancer.filesUpload, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * Get files list (with optional category filter)
   */
  getFiles: async (category?: FileCategory): Promise<FileMetadata[]> => {
    const params = category ? { category } : {};
    const response = await api.get(ENDPOINTS.freelancer.filesList, { params });
    const backendData = response.data.data || response.data;

    // New API response structure: { files: [...], total: number }
    let filesArray: any[] = [];

    if (backendData.files && Array.isArray(backendData.files)) {
      // New structure: direct files array
      filesArray = backendData.files;
    } else if (Array.isArray(backendData)) {
      // Fallback: if data is directly an array
      filesArray = backendData;
    } else if (
      backendData.verificationDocuments &&
      Array.isArray(backendData.verificationDocuments)
    ) {
      // Legacy structure: transform old format
      filesArray = backendData.verificationDocuments.map((doc: any, index: number) => ({
        id: doc.id || `verification-${index}-${Date.now()}`,
        title: doc.title || doc.originalName || `Verification Document ${index + 1}`,
        fileUrl: doc.url,
        fileName: doc.originalName || `verification_document_${index + 1}`,
        fileSize: doc.fileSize || 0,
        fileType: doc.format || 'unknown',
        createdAt: doc.uploadedAt
          ? new Date(doc.uploadedAt).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })
          : new Date().toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            }),
        updatedAt: doc.approvedAt || doc.uploadedAt || new Date().toISOString(),
      }));

      // Add first aid certificate if exists
      if (backendData.firstAidCertificate) {
        const cert = backendData.firstAidCertificate;
        filesArray.push({
          id: cert.id || `certificate-${Date.now()}`,
          title: cert.title || cert.originalName || 'First Aid Certificate',
          fileUrl: cert.url,
          fileName: cert.originalName || 'first_aid_certificate',
          fileSize: cert.fileSize || 0,
          fileType: cert.format || 'unknown',
          createdAt: cert.uploadedAt
            ? new Date(cert.uploadedAt).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })
            : new Date().toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              }),
          updatedAt: cert.approvedAt || cert.uploadedAt || new Date().toISOString(),
        });
      }
    }

    // Transform to FileMetadata format
    const files: FileMetadata[] = filesArray.map((file: any) => ({
      id: file.id,
      title: file.title || file.fileName || 'Untitled',
      fileUrl: file.fileUrl || file.url,
      fileName: file.fileName || file.originalName || 'unknown',
      fileSize: file.fileSize || 0,
      fileType: file.fileType || file.format || 'unknown',
      // Use category from API response, fallback to VERIFICATION for legacy data
      category: file.category || 'VERIFICATION',
      createdAt: file.createdAt
        ? new Date(file.createdAt).toISOString()
        : file.uploadedAt
          ? new Date(file.uploadedAt).toISOString()
          : new Date().toISOString(),
      updatedAt: file.updatedAt || file.createdAt || file.uploadedAt || new Date().toISOString(),
    }));

    // Apply category filter if specified (though all files are VERIFICATION now)
    if (category) {
      return files.filter((file) => file.category === category);
    }

    return files;
  },

  /**
   * Download a file
   */
  downloadFile: async (fileId: string): Promise<Blob> => {
    const response = await api.get(ENDPOINTS.freelancer.fileDownload(fileId), {
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
    const response = await api.get(ENDPOINTS.freelancer.fileSignedUrl(fileId));
    return response.data.data || response.data;
  },

  /**
   * Delete a file
   */
  deleteFile: async (fileId: string): Promise<{ success: boolean; message?: string }> => {
    const response = await api.delete(ENDPOINTS.freelancer.fileDelete(fileId));
    return response.data;
  },
};

export default freelancerFileService;
