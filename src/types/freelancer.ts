/**
 * Freelancer-related types
 */
import type { CardInfo } from './common';
import type { PlanFeatures, SubscriptionPlanType } from './subscription';

// Job Title interface for freelancers
export interface JobTitle {
  id: string;
  name: string;
  description: string;
}

export interface JobTitlesResponse {
  success: boolean;
  data: JobTitle[];
}

export type FirstAidCertificateStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// Freelancer File Type
export type FreelancerFileType =
  | 'CERTIFICATE'
  | 'VERIFICATION_DOCUMENT'
  | 'PROFILE_PICTURE'
  | 'OTHER';

// Individual File Structure (from backend)
export interface BackendFile {
  url: string;
  type: string;
  uploadedAt: string;
  fileSize: number;
  format: string;
  originalName: string;
  status?: string;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
}

// Backend Response Structure
export interface FreelancerFilesResponse {
  profilePicture?: BackendFile;
  firstAidCertificate?: BackendFile;
  verificationDocuments?: BackendFile[];
}

// Flattened File for DataTable
export interface FreelancerFile {
  id: string;
  fileName: string;
  fileType: FreelancerFileType;
  url: string;
  publicId?: string;
  fileSize: number;
  uploadedAt: string;
  status?: string;
  format?: string;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
}

// First Aid Certificate Info
export interface FirstAidCertificateInfo {
  firstAidCertificateUrl: string;
  firstAidCertificateStatus: FirstAidCertificateStatus;
  firstAidCertificateApprovedAt: Date | null;
  firstAidCertificateRejectedAt: Date | null;
  firstAidCertificateRejectionReason: string | null;
}

export interface Freelancer {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  city: string;
  isActive: boolean;
  isFavorite?: boolean;
  favoritedAt?: string;
  verificationStatus?:
    | 'verified'
    | 'pending'
    | 'rejected'
    | 'unverified'
    | 'APPROVED'
    | 'PENDING'
    | 'REJECTED'
    | 'UNVERIFIED';
  // New fields for enhanced freelancer profile
  mainJobTitle?: JobTitle;
  clinicAddress?: string;
  verificationDocuments?: string[];
  verificationRequestedAt?: Date | null;
  verificationApprovedAt?: Date | null;
  verificationRejectedAt?: Date | null;
  verificationRejectionReason?: string | null;
  firstAidCertificateUrl?: string;
  firstAidCertificateStatus?: FirstAidCertificateStatus;
  firstAidCertificateApprovedAt?: Date | null;
  firstAidCertificateRejectedAt?: Date | null;
  firstAidCertificateRejectionReason?: string | null;
  cardInfo: CardInfo;
  slotSummary?: {
    nextAvailable: {
      id: string;
      startTime: string;
      endTime: string;
      status: string;
    } | null;
    totalSlots: number;
    availableSlots: number;
  };
  slots: Array<{
    id: string;
    startTime: string;
    endTime: string;
    status: string;
  }>;
  services: Array<{
    id: string;
    name: string;
    description: string;
    additionalPrice: number;
    duration: number;
  }>;
  locations: Array<{
    id: string;
    name: string;
    address: string;
    type: string;
  }>;
  planFeatures?: PlanFeatures | null;
  createdAt: string;
  updatedAt: string;
}

export type FreelancerStatCardType = {
  id: number;
  title: string;
  number: number;
  icon: JSX.Element;
  percentage: 'up' | 'down';
  percentageNumber: number;
};

/**
 * Expert interface (used for freelancer display in user-facing components)
 */
export interface Expert {
  id: string;
  name: string;
  specialty: string;
  jobTitle?: JobTitle;
  rating?: number;
  reviews: number;
  description: string;
  isFavorite?: boolean;
  profilePicture?: string;
  services?: unknown[];
  location?: string;
  sessionTypes?: string[];
  pricing?: {
    lowestPrice?: number;
    highestPrice?: number;
    currency?: string;
    hasPriceRange?: boolean;
    online?: { min: number; max: number };
    office?: { min: number; max: number };
    home?: { min: number; max: number };
  };
  email?: string;
  gender?: string;
  city?: string;
  isEmailVerified?: boolean;
  isActive?: boolean;
  authProvider?: string;
  verificationStatus?:
    | 'verified'
    | 'pending'
    | 'rejected'
    | 'unverified'
    | 'APPROVED'
    | 'PENDING'
    | 'REJECTED'
    | 'UNVERIFIED';
  firstAidCertificateStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  slots?: unknown[];
  slotSummary?: unknown;
  favoritedBy?: unknown[];
  cardInfo?: CardInfo;
  availableSlots?: number;
  totalSlots?: number;
  planFeatures?: PlanFeatures | null;
  tier?: SubscriptionPlanType | null;
  subscriptionStatus?: {
    isTrial: boolean;
    isExpiredTrial: boolean;
    trialEndsAt: string | null;
    canAcceptBookings: boolean;
    message: string | null;
  };
  stampInfo?: {
    currentStampCount: number;
    stampTarget: number;
    stampsRemaining: number;
    rewardReady: boolean;
    rewardReserved: boolean;
    discountPercentage: number;
    customConfigApplied: boolean;
  } | null;
}
