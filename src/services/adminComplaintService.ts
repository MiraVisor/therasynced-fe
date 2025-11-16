import { ComplaintStatus, PaginationDto } from '@/types/types';

import api from './api';
import { ENDPOINTS } from './endpoints';

export interface UpdateComplaintStatusDto {
  status: ComplaintStatus;
  adminNotes?: string;
}

export interface TakeActionDto {
  action: 'WARN' | 'SUSPEND';
  reason: string;
  duration?: number; // in days, for suspension
}

export interface ComplaintListResponse {
  success: boolean;
  data: Array<{
    id: string;
    reporter: {
      id: string;
      name: string;
      email: string;
    };
    reportedUser: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
    category: string;
    reason: string;
    description: string;
    status: ComplaintStatus;
    createdAt: string;
    updatedAt: string;
  }>;
  total?: number;
}

const adminComplaintService = {
  // Get all complaints
  getAll: async (pagination?: PaginationDto, filters?: { status?: string; category?: string }) => {
    const response = await api.get(ENDPOINTS.admin.complaint.getAll, {
      params: { ...pagination, ...filters },
    });
    return response.data;
  },

  // Get complaint statistics
  getStatistics: async () => {
    const response = await api.get(ENDPOINTS.admin.complaint.statistics);
    return response.data;
  },

  // Get pending complaints
  getPending: async (pagination?: PaginationDto) => {
    const response = await api.get(ENDPOINTS.admin.complaint.getPending, {
      params: pagination,
    });
    return response.data;
  },

  // Get under review complaints
  getUnderReview: async (pagination?: PaginationDto) => {
    const response = await api.get(ENDPOINTS.admin.complaint.getUnderReview, {
      params: pagination,
    });
    return response.data;
  },

  // Get resolved complaints
  getResolved: async (pagination?: PaginationDto) => {
    const response = await api.get(ENDPOINTS.admin.complaint.getResolved, {
      params: pagination,
    });
    return response.data;
  },

  // Get dismissed complaints
  getDismissed: async (pagination?: PaginationDto) => {
    const response = await api.get(ENDPOINTS.admin.complaint.getDismissed, {
      params: pagination,
    });
    return response.data;
  },

  // Get complaint details
  getDetails: async (complaintId: string) => {
    const response = await api.get(ENDPOINTS.admin.complaint.getDetails(complaintId));
    return response.data;
  },

  // Update complaint status
  updateStatus: async (complaintId: string, data: UpdateComplaintStatusDto) => {
    const response = await api.patch(ENDPOINTS.admin.complaint.updateStatus(complaintId), data);
    return response.data;
  },

  // Take action on reported user
  takeAction: async (complaintId: string, data: TakeActionDto) => {
    const response = await api.post(ENDPOINTS.admin.complaint.takeAction(complaintId), data);
    return response.data;
  },
};

export default adminComplaintService;
