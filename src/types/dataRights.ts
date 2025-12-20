// Data Rights and GDPR Compliance Types

// Breach Enums
export enum BreachStatus {
  DETECTED = 'DETECTED',
  INVESTIGATING = 'INVESTIGATING',
  CONTAINED = 'CONTAINED',
  RESOLVED = 'RESOLVED',
}

export enum BreachRiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

// Breach Data Model
export interface DataBreach {
  id: string;
  detectedAt: string; // ISO date string
  description: string;
  dataCategories: string[];
  affectedUsers: number;
  riskLevel: BreachRiskLevel;
  status: BreachStatus;
  reportedToDpc: boolean;
  reportedAt: string | null; // ISO date string or null
  notifiedUsers: boolean;
  notifiedAt: string | null; // ISO date string or null
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// Request DTOs
export interface CreateBreachDto {
  description: string;
  dataCategories: string[];
  affectedUsers: number;
  riskLevel: BreachRiskLevel;
}

export interface UpdateBreachStatusDto {
  status: BreachStatus;
  notes?: string;
}

export interface ReportDpcDto {
  notes?: string;
}

export interface NotifyUsersDto {
  notes?: string;
}

// Response Types
export interface BreachListResponse {
  success: boolean;
  message: string;
  data: DataBreach[];
  pagination: {
    skip: number;
    take: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta: {
    timestamp: string;
    path: string;
  };
}

export interface BreachDetailResponse {
  success: boolean;
  message: string;
  data: DataBreach;
  meta: {
    timestamp: string;
    path: string;
  };
}

// Breach Filters
export interface BreachFilters {
  status?: BreachStatus;
  riskLevel?: BreachRiskLevel;
  skip?: number;
  take?: number;
}

// Health Data Access Logs
export interface HealthDataAccessLog {
  id: string;
  userId: string;
  accessedBy: string;
  dataType: 'booking' | 'complaint' | 'consent' | 'data-rights' | 'profile';
  dataId: string | null;
  action: 'ACCESS' | 'EDIT' | 'DELETE';
  purpose: string;
  ipAddress: string | null;
  userAgent: string | null;
  accessedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role?: string; // Role of the data owner (PATIENT, FREELANCER, ADMIN)
  };
  accessedByUser: {
    id: string;
    name: string;
    email: string;
    role?: string; // Role of the person who accessed (PATIENT, FREELANCER, ADMIN)
  };
  isSelfAccess?: boolean; // Indicates if the patient accessed their own data
}

export interface HealthDataLogsFilters {
  skip?: number;
  take?: number;
  startDate?: string;
  endDate?: string;
  dataType?: 'booking' | 'complaint' | 'consent' | 'data-rights' | 'profile';
  action?: 'ACCESS' | 'EDIT' | 'DELETE';
}

export interface AdminHealthDataLogsFilters extends HealthDataLogsFilters {
  userId?: string;
  accessedBy?: string;
}

export interface HealthDataLogsResponse {
  success: boolean;
  message: string;
  data: HealthDataAccessLog[];
  pagination: {
    skip: number;
    take: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta: {
    timestamp: string;
    path: string;
  };
}

// Data Rights Types
export interface DataExportResponse {
  success: boolean;
  message: string;
  data: {
    profile: any;
    bookings: any[];
    messages: any[];
    complaints: {
      reported: any[];
      received: any[];
    };
    healthData: {
      firstAidCertificate: any;
      consents: any[];
    };
    payments: {
      subscription: any;
      stripeCustomerId: string;
      bookingAmounts: any[];
    };
    preferences: {
      favorites: any[];
      loyaltyProfile: any;
    };
    ratings: {
      given: any[];
      received: any[];
    };
    notifications: any[];
    cookieConsent: any;
  };
  anonymized?: boolean;
}

export interface DeleteAccountRequest {
  password?: string;
}

export interface DeleteAccountResponse {
  success: boolean;
  message: string;
  data: {
    deletedAt: string;
  };
}

export interface HealthDataConsentRequest {
  consentType: 'MEDICAL_HISTORY' | 'SOAP_NOTES' | 'COMPLAINTS' | 'FIRST_AID_CERTIFICATE';
  granted: boolean;
}

export interface HealthDataConsentResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    userId: string;
    consentType: string;
    granted: boolean;
    grantedAt: string;
    withdrawnAt: string | null;
  };
}

export interface HealthDataConsentStatusResponse {
  success: boolean;
  message: string;
  data: {
    consents: Array<{
      consentType: string;
      granted: boolean;
      grantedAt: string | null;
      withdrawnAt: string | null;
    }>;
  };
}

export interface DataRightsStatusResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    email: string;
    isAnonymized: boolean;
    isDeleted: boolean;
    deletedAt: string | null;
    processingRestricted: boolean;
    processingRestrictedCategories: string[];
    objectedToProcessing: boolean;
    objectedProcessingTypes: string[];
    healthDataConsents: Array<{
      consentType: string;
      granted: boolean;
      grantedAt: string | null;
      withdrawnAt: string | null;
    }>;
    cookieConsent: {
      essential: boolean;
      analytics: boolean;
      marketing: boolean;
    } | null;
    recentDataRightsRequests: Array<{
      id: string;
      requestType: string;
      requestedAt: string;
      status: string;
    }>;
  };
}

export interface RestrictProcessingRequest {
  reason: string;
  dataCategories: string[];
}

export interface RestrictProcessingResponse {
  success: boolean;
  message: string;
  data: {
    restrictedCategories: string[];
  };
}

export interface ObjectProcessingRequest {
  processingType: string;
  reason: string;
}

export interface ObjectProcessingResponse {
  success: boolean;
  message: string;
  data: {
    objectedProcessingTypes: string[];
  };
}

export interface CookieConsentRequest {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

export interface CookieConsentResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    userId: string;
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
  };
}
