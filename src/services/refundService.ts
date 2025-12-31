import api from './api';
import { ENDPOINTS } from './endpoints';

export interface CreateRefundRequestDto {
  invoiceId: string;
  amount: number;
  reason: string;
  description?: string;
  attachments?: string[];
}

export interface RefundRequest {
  id: string;
  freelancerId: string;
  invoiceId: string;
  amount: number;
  reason: string;
  description?: string;
  attachments: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSED';
  adminId?: string;
  adminNotes?: string;
  stripeRefundId?: string;
  rejectedAt?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  freelancer?: {
    id: string;
    name: string;
    email: string;
  };
  admin?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ProcessRefundRequestDto {
  adminNotes?: string;
}

export interface RejectRefundRequestDto {
  adminNotes: string;
}

const refundService = {
  // Create refund request
  create: async (data: CreateRefundRequestDto) => {
    const response = await api.post(ENDPOINTS.refund.create, data);
    return response.data;
  },

  // Get my refund requests
  getMyRequests: async () => {
    const response = await api.get(ENDPOINTS.refund.myRequests);
    return response.data;
  },

  // Get refund request details
  getDetails: async (id: string) => {
    const response = await api.get(ENDPOINTS.refund.getDetails(id));
    return response.data;
  },

  // Admin: Get all refund requests
  adminGetAll: async (status?: string) => {
    const response = await api.get(ENDPOINTS.refund.adminAll, {
      params: status ? { status } : {},
    });
    return response.data;
  },

  // Admin: Approve refund request
  adminApprove: async (id: string, data: ProcessRefundRequestDto) => {
    const response = await api.put(ENDPOINTS.refund.adminApprove(id), data);
    return response.data;
  },

  // Admin: Reject refund request
  adminReject: async (id: string, data: RejectRefundRequestDto) => {
    const response = await api.put(ENDPOINTS.refund.adminReject(id), data);
    return response.data;
  },
};

export default refundService;
