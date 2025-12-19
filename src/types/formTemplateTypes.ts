// Form Template Types

export interface FormTemplateResponseDto {
  id: string; // UUID
  title: string;
  fileUrl: string; // Cloudinary URL
  fileName: string;
  fileSize: number; // bytes
  isVisible: boolean;
  createdBy: string; // admin user ID
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface FormTemplateDownloadResponse {
  success: boolean;
  data: {
    fileUrl: string;
    fileName: string;
  };
}

export interface UploadFormTemplateDto {
  file: File;
  title: string;
}

export interface UpdateFormTemplateDto {
  title?: string;
  isVisible?: boolean;
}
