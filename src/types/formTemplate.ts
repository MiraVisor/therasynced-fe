export interface FormTemplate {
  id: string;
  title: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  isVisible: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  publicId?: string; // Internal use only
}

export interface CreateFormTemplateDto {
  file: File;
  title: string;
}

export interface UpdateFormTemplateDto {
  title?: string;
  isVisible?: boolean;
}

export interface DownloadFormTemplateDto {
  token: string;
}
