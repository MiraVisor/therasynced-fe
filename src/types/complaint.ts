/**
 * Complaint-related types
 */
import type { ComplaintCategory, ComplaintStatus } from './enums';

export interface Complaint {
  id: string;
  reporterId: string;
  reporter: {
    id: string;
    name: string;
    email: string;
  };
  reportedUserId: string;
  reportedUser: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  category: ComplaintCategory;
  reason: string;
  description: string;
  evidence: string[];
  status: ComplaintStatus;
  actionTaken?: 'WARNED' | 'SUSPENDED' | null;
  adminResponse?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateComplaintDto {
  reportedUserId: string;
  category: ComplaintCategory;
  reason: string;
  description: string;
  evidence?: string[];
}
