import {
  FormTemplateDownloadResponse,
  FormTemplateResponseDto,
  UpdateFormTemplateDto,
  UploadFormTemplateDto,
} from '@/types/formTemplateTypes';

import api from './api';
import { ENDPOINTS } from './endpoints';

const formTemplateService = {
  // Admin: Upload form template
  upload: async (data: UploadFormTemplateDto): Promise<FormTemplateResponseDto> => {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('title', data.title);

    const response = await api.post(ENDPOINTS.admin.formTemplates.upload, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // Admin: Get all form templates
  getAll: async (): Promise<FormTemplateResponseDto[]> => {
    const response = await api.get(ENDPOINTS.admin.formTemplates.getAll);
    return response.data.data;
  },

  // Admin: Get form template by ID
  getById: async (id: string): Promise<FormTemplateResponseDto> => {
    const response = await api.get(ENDPOINTS.admin.formTemplates.getById(id));
    return response.data.data;
  },

  // Admin: Update form template
  update: async (id: string, data: UpdateFormTemplateDto): Promise<FormTemplateResponseDto> => {
    const response = await api.patch(ENDPOINTS.admin.formTemplates.update(id), data);
    return response.data.data;
  },

  // Admin: Delete form template
  delete: async (id: string): Promise<void> => {
    await api.delete(ENDPOINTS.admin.formTemplates.delete(id));
  },

  // Admin: Get form template download (streams PDF)
  download: async (id: string, token: string): Promise<Blob> => {
    const response = await api.post(
      ENDPOINTS.admin.formTemplates.download(id),
      { token },
      {
        responseType: 'blob',
      },
    );
    return response.data;
  },

  // Freelancer: Get visible form templates
  getVisible: async (): Promise<FormTemplateResponseDto[]> => {
    const response = await api.get(ENDPOINTS.freelancer.formTemplates.getVisible);
    return response.data.data;
  },

  // Freelancer: Get form template download URL
  getDownloadUrl: async (id: string): Promise<FormTemplateDownloadResponse> => {
    const response = await api.get(ENDPOINTS.freelancer.formTemplates.getDownloadUrl(id));
    return response.data;
  },
};

export default formTemplateService;
