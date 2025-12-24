// File upload utility for handling certificate and document uploads
// Now integrated with real backend Cloudinary upload service
import {
  deleteFromCloudinary,
  type UploadProgress as ServiceUploadProgress,
  uploadFirstAidCertificate,
  type UploadOptions,
  uploadSingleImage,
  uploadVerificationDocument,
  validateFile as validateFileService,
} from '@/services/imageUploadService';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  fileId?: string;
  publicId?: string;
}

export interface FileUploadOptions {
  // in bytes
  maxSize?: number;
  allowedTypes?: string[];
  // folder path in cloud storage (deprecated - now handled by backend)
  folder?: string;
  uploadType?: 'single' | 'verification-document' | 'first-aid-certificate';
}

// Default configuration
const DEFAULT_OPTIONS: Required<FileUploadOptions> = {
  // 5MB
  maxSize: 5 * 1024 * 1024,
  allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
  // Deprecated
  folder: 'uploads',
  uploadType: 'single',
};

// Validate file before upload
export const validateFile = (
  file: File,
  options: FileUploadOptions = {},
): { valid: boolean; error?: string } => {
  const config = { ...DEFAULT_OPTIONS, ...options };

  // Convert FileUploadOptions to UploadOptions for the service
  const serviceOptions: UploadOptions = {
    maxSize: config.maxSize,
    allowedTypes: config.allowedTypes,
  };

  return validateFileService(file, serviceOptions);
};

// Upload file using the appropriate service based on upload type
export const uploadFile = async (
  file: File,
  options: FileUploadOptions = {},
  onProgress?: (progress: UploadProgress) => void,
): Promise<UploadResult> => {
  try {
    // Validate file first
    const validation = validateFile(file, options);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    const config = { ...DEFAULT_OPTIONS, ...options };

    // Convert progress callback
    const progressCallback = onProgress
      ? (progress: ServiceUploadProgress) => {
          onProgress({
            loaded: progress.loaded,
            total: progress.total,
            percentage: progress.percentage,
          });
        }
      : undefined;

    // Convert options for service
    const serviceOptions: UploadOptions = {
      maxSize: config.maxSize,
      allowedTypes: config.allowedTypes,
    };

    // Choose upload function based on type
    let result;
    switch (config.uploadType) {
      case 'verification-document':
        result = await uploadVerificationDocument(file, serviceOptions, progressCallback);
        break;
      case 'first-aid-certificate':
        result = await uploadFirstAidCertificate(file, serviceOptions, progressCallback);
        break;
      case 'single':
      default:
        result = await uploadSingleImage(file, serviceOptions, progressCallback);
        break;
    }

    return {
      success: result.success,
      url: result.url,
      publicId: result.publicId,
      // Use publicId as fileId for backward compatibility
      fileId: result.publicId,
      error: result.error,
    };
  } catch (error) {
    console.error('File upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
};

// Upload multiple files
export const uploadMultipleFiles = async (
  files: File[],
  options: FileUploadOptions = {},
  onProgress?: (fileIndex: number, progress: UploadProgress) => void,
): Promise<UploadResult[]> => {
  const results: UploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file) {
      throw new Error('No file provided');
    }
    const progressCallback = onProgress
      ? (progress: UploadProgress) => onProgress(i, progress)
      : undefined;

    const result = await uploadFile(file, options, progressCallback);
    results.push(result);
  }

  return results;
};

// Delete file from Cloudinary
export const deleteFile = async (
  publicId: string,
): Promise<{ success: boolean; error?: string }> => {
  try {
    return await deleteFromCloudinary(publicId);
  } catch (error) {
    console.error('File deletion error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Deletion failed',
    };
  }
};

// Get file preview URL (for images and PDFs)
export const getFilePreviewUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

// Revoke preview URL to free memory
export const revokeFilePreviewUrl = (url: string): void => {
  URL.revokeObjectURL(url);
};

// Format file size for display
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Get file type icon
export const getFileTypeIcon = (fileType: string): string => {
  if (fileType.startsWith('image/')) {
    return '🖼️';
  } else if (fileType === 'application/pdf') {
    return '📄';
  } else if (fileType.includes('document') || fileType.includes('text')) {
    return '📝';
  } else {
    return '📎';
  }
};

// Check if file is an image
export const isImageFile = (fileType: string): boolean => {
  return fileType.startsWith('image/');
};

// Check if file is a PDF
export const isPdfFile = (fileType: string): boolean => {
  return fileType === 'application/pdf';
};
