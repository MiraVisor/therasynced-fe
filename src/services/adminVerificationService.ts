import { PaginationDto } from '@/types/types';

import api from './api';
import { ENDPOINTS } from './endpoints';

export interface ApproveVerificationDto {
  freelancerId: string;
}

export interface RejectVerificationDto {
  freelancerId: string;
  rejectionReason: string;
}

export interface ApproveCertificateDto {
  freelancerId: string;
}

export interface RejectCertificateDto {
  freelancerId: string;
  rejectionReason: string;
}

export interface VerificationDetailsResponse {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  verificationDocuments: Array<{
    id: string;
    url: string;
    type: string;
    uploadedAt: string;
  }>;
  firstAidCertificate?: {
    url: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    uploadedAt: string;
    approvedAt?: string;
    rejectedAt?: string;
    rejectionReason?: string;
  };
  services: Array<{
    id: string;
    name: string;
    price: number;
    duration: number;
  }>;
  locations: Array<{
    id: string;
    address: string;
    city: string;
  }>;
  verificationRequestedAt?: string;
  verificationApprovedAt?: string;
  verificationRejectedAt?: string;
  verificationRejectionReason?: string;
}

export interface PendingVerificationResponse {
  id: string;
  name: string;
  email: string;
  city?: string;
  profilePicture?: string;
  isActive?: boolean;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  verificationDocuments?: string[]; // Array of URLs
  firstAidCertificateUrl?: string; // Single URL
  firstAidCertificateStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  verificationRequestedAt?: string;
  verificationApprovedAt?: string;
  verificationRejectedAt?: string;
  createdAt?: string;
  freelancerId?: string; // Optional as it might be id
}

const adminVerificationService = {
  // Get pending verifications
  getPending: async (pagination?: PaginationDto) => {
    const response = await api.get(ENDPOINTS.admin.verification.getPending, {
      params: pagination,
    });
    return response.data;
  },

  // Get all verifications (with optional status filter)
  getAll: async (status?: 'PENDING' | 'APPROVED' | 'REJECTED', pagination?: PaginationDto) => {
    const params: any = { ...pagination };
    if (status) {
      params.status = status;
    }
    const response = await api.get(ENDPOINTS.admin.verification.getAll, {
      params,
    });
    return response.data;
  },

  // Get verification details
  getDetails: async (freelancerId: string) => {
    const response = await api.get(ENDPOINTS.admin.verification.getDetails(freelancerId));
    return response.data;
  },

  // Approve verification
  approve: async (data: ApproveVerificationDto) => {
    const response = await api.patch(ENDPOINTS.admin.verification.approve(data.freelancerId));
    return response.data;
  },

  // Reject verification
  reject: async (data: RejectVerificationDto) => {
    const response = await api.patch(ENDPOINTS.admin.verification.reject(data.freelancerId), {
      rejectionReason: data.rejectionReason,
    });
    return response.data;
  },

  // Get verifications by status
  getByStatus: async (status: 'PENDING' | 'APPROVED' | 'REJECTED', pagination?: PaginationDto) => {
    const params: any = { ...pagination, status };
    const response = await api.get(ENDPOINTS.admin.verification.getAll, {
      params,
    });
    return response.data;
  },

  // Approve first aid certificate
  approveCertificate: async (data: ApproveCertificateDto) => {
    const response = await api.patch(
      ENDPOINTS.admin.verification.approveCertificate(data.freelancerId),
    );
    return response.data;
  },

  // Reject first aid certificate
  rejectCertificate: async (data: RejectCertificateDto) => {
    const response = await api.patch(
      ENDPOINTS.admin.verification.rejectCertificate(data.freelancerId),
      {
        rejectionReason: data.rejectionReason,
      },
    );
    return response.data;
  },
};

export default adminVerificationService;
