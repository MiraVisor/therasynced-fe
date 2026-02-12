import api from './api';
import { ENDPOINTS } from './endpoints';

// Types
export interface DocumentRequirement {
  id: string;
  jobTitleId: string;
  name: string;
  description?: string;
  isMandatory: boolean;
  hasExpiry: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  jobTitle?: {
    id: string;
    name: string;
  };
}

export interface CreateDocumentRequirementDto {
  jobTitleId: string;
  name: string;
  description?: string;
  isMandatory?: boolean;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateDocumentRequirementDto {
  name?: string;
  description?: string;
  isMandatory?: boolean;
  sortOrder?: number;
  isActive?: boolean;
}

export interface DocumentRequirementListResponse {
  success: boolean;
  data: {
    jobTitle: {
      id: string;
      name: string;
    };
    requirements: DocumentRequirement[];
  }[];
}

export interface DocumentRequirementResponse {
  success: boolean;
  message?: string;
  data: DocumentRequirement;
}

export interface FreelancerRequirementStatus {
  requirement: DocumentRequirement;
  uploaded: boolean;
  uploadedFile?: {
    id: string;
    title: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
    category: string | null;
    expiryDate?: string;
    createdAt: string;
  };
}

export interface FreelancerRequirementsStatusResponse {
  success: boolean;
  data: FreelancerRequirementStatus[];
}

export interface CanCreateSlotsResponse {
  allowed: boolean;
  missingMandatory: string[];
  message?: string;
}

// Service
const documentRequirementService = {
  // Admin: Create a new document requirement
  create: async (data: CreateDocumentRequirementDto): Promise<DocumentRequirementResponse> => {
    const response = await api.post(ENDPOINTS.documentRequirements.create, data);
    return response.data;
  },

  // Admin: Get all document requirements grouped by job title
  getAll: async (): Promise<DocumentRequirementListResponse> => {
    const response = await api.get(ENDPOINTS.documentRequirements.getAll);
    return response.data;
  },

  // Admin: Get document requirements for a specific job title
  getByJobTitle: async (
    jobTitleId: string,
  ): Promise<{ success: boolean; data: DocumentRequirement[] }> => {
    const response = await api.get(ENDPOINTS.documentRequirements.getByJobTitle(jobTitleId));
    return response.data;
  },

  // Admin: Get a single document requirement by ID
  getById: async (id: string): Promise<DocumentRequirementResponse> => {
    const response = await api.get(ENDPOINTS.documentRequirements.getById(id));
    return response.data;
  },

  // Admin: Update a document requirement
  update: async (
    id: string,
    data: UpdateDocumentRequirementDto,
  ): Promise<DocumentRequirementResponse> => {
    const response = await api.patch(ENDPOINTS.documentRequirements.update(id), data);
    return response.data;
  },

  // Admin: Delete a document requirement
  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(ENDPOINTS.documentRequirements.delete(id));
    return response.data;
  },

  // Admin: Get requirements status for a specific freelancer
  getFreelancerStatus: async (
    freelancerId: string,
  ): Promise<FreelancerRequirementsStatusResponse> => {
    const response = await api.get(
      ENDPOINTS.documentRequirements.adminFreelancerStatus(freelancerId),
    );
    return response.data;
  },

  // Freelancer: Get requirements status for authenticated user
  getMyStatus: async (): Promise<FreelancerRequirementsStatusResponse> => {
    const response = await api.get(ENDPOINTS.documentRequirements.myStatus);
    return response.data;
  },

  // Admin: Set expiry date on a freelancer file
  setFileExpiry: async (
    fileId: string,
    expiryDate: string,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.patch(ENDPOINTS.documentRequirements.setFileExpiry(fileId), {
      expiryDate,
    });
    return response.data;
  },

  // Freelancer: Check if user can create slots
  canCreateSlots: async (): Promise<CanCreateSlotsResponse> => {
    const response = await api.get(ENDPOINTS.documentRequirements.canCreateSlots);
    return response.data;
  },
};

export default documentRequirementService;
