import { getDecodedToken } from '@/lib/utils';
import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';

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

// Health Data Access Logs interfaces
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

/**
 * Get current user's data rights status
 * Use this endpoint for the data rights page to get the user's own status
 * (including consents, restrictions, etc.)
 */
export const getDataRightsStatus = async (): Promise<DataRightsStatusResponse> => {
  const response = await api.get<DataRightsStatusResponse>(ENDPOINTS.dataRights.status);
  return response.data;
};

/**
 * Export all user data (Right of Access - GDPR Article 15)
 */
export const exportUserData = async (): Promise<DataExportResponse> => {
  const response = await api.get<DataExportResponse>(ENDPOINTS.dataRights.export);
  return response.data;
};

/**
 * Export user data in portable format (Right to Data Portability - GDPR Article 20)
 * @param format - 'json' (default) or 'csv'
 */
export const exportDataPortable = async (
  format: 'json' | 'csv' = 'json',
): Promise<DataExportResponse | string> => {
  const response = await api.get<DataExportResponse | string>(
    `${ENDPOINTS.dataRights.exportPortable}?format=${format}`,
  );
  return response.data;
};

/**
 * Delete user account (Right to Erasure - GDPR Article 17)
 * @param password - Optional password confirmation
 */
export const deleteAccount = async (password?: string): Promise<DeleteAccountResponse> => {
  const response = await api.delete<DeleteAccountResponse>(ENDPOINTS.dataRights.deleteAccount, {
    data: password ? { password } : undefined,
  });
  return response.data;
};

/**
 * Restrict processing of user data (Right to Restrict Processing - GDPR Article 18)
 */
export const restrictProcessing = async (
  data: RestrictProcessingRequest,
): Promise<RestrictProcessingResponse> => {
  const response = await api.post<RestrictProcessingResponse>(
    ENDPOINTS.dataRights.restrictProcessing,
    data,
  );
  return response.data;
};

/**
 * Object to processing of user data (Right to Object - GDPR Article 21)
 */
export const objectToProcessing = async (
  data: ObjectProcessingRequest,
): Promise<ObjectProcessingResponse> => {
  const response = await api.post<ObjectProcessingResponse>(
    ENDPOINTS.dataRights.objectProcessing,
    data,
  );
  return response.data;
};

/**
 * Update health data consent (GDPR Article 9 - Explicit Consent)
 */
export const updateHealthDataConsent = async (
  data: HealthDataConsentRequest,
): Promise<HealthDataConsentResponse> => {
  const response = await api.post<HealthDataConsentResponse>(ENDPOINTS.consent.healthData, data);
  return response.data;
};

/**
 * Get health data consent status
 * @param userId - Optional user ID to check consent for (for freelancers checking client consent)
 *                  If not provided, uses the current authenticated user's ID
 */
export const getHealthDataConsent = async (
  userId?: string,
): Promise<HealthDataConsentStatusResponse> => {
  // If userId is not provided, get current user ID from token
  let targetUserId = userId;
  if (!targetUserId) {
    const decodedToken = getDecodedToken();
    if (!decodedToken?.sub) {
      throw new Error('Unable to get current user ID. Please ensure you are logged in.');
    }
    targetUserId = decodedToken.sub;
  }

  const response = await api.get<HealthDataConsentStatusResponse>(
    ENDPOINTS.consent.healthData,
    {
      params: {
        userId: targetUserId,
      },
    },
  );
  return response.data;
};

/**
 * Store cookie consent preferences (optional - syncs with backend)
 */
export const storeCookieConsent = async (
  data: CookieConsentRequest,
): Promise<CookieConsentResponse> => {
  const response = await api.post<CookieConsentResponse>(ENDPOINTS.consent.cookies, data);
  return response.data;
};

/**
 * Get user's own health data access logs
 * @param filters - Optional filters for pagination, date range, data type, and action
 */
export const getMyHealthDataLogs = async (
  filters?: HealthDataLogsFilters,
): Promise<HealthDataLogsResponse> => {
  const params = new URLSearchParams();

  if (filters?.skip !== undefined) {
    params.append('skip', filters.skip.toString());
  }
  if (filters?.take !== undefined) {
    params.append('take', filters.take.toString());
  }
  if (filters?.startDate) {
    params.append('startDate', filters.startDate);
  }
  if (filters?.endDate) {
    params.append('endDate', filters.endDate);
  }
  if (filters?.dataType) {
    params.append('dataType', filters.dataType);
  }
  if (filters?.action) {
    params.append('action', filters.action);
  }

  const queryString = params.toString();
  const url = queryString
    ? `${ENDPOINTS.dataRights.myHealthDataLogs}?${queryString}`
    : ENDPOINTS.dataRights.myHealthDataLogs;

  const response = await api.get<HealthDataLogsResponse>(url);
  return response.data;
};

/**
 * Get all health data access logs (Admin only)
 * @param filters - Optional filters including userId and accessedBy for admin view
 */
export const getAllHealthDataLogs = async (
  filters?: AdminHealthDataLogsFilters,
): Promise<HealthDataLogsResponse> => {
  const params = new URLSearchParams();

  if (filters?.skip !== undefined) {
    params.append('skip', filters.skip.toString());
  }
  if (filters?.take !== undefined) {
    params.append('take', filters.take.toString());
  }
  if (filters?.startDate) {
    params.append('startDate', filters.startDate);
  }
  if (filters?.endDate) {
    params.append('endDate', filters.endDate);
  }
  if (filters?.dataType) {
    params.append('dataType', filters.dataType);
  }
  if (filters?.action) {
    params.append('action', filters.action);
  }
  if (filters?.userId) {
    params.append('userId', filters.userId);
  }
  if (filters?.accessedBy) {
    params.append('accessedBy', filters.accessedBy);
  }

  const queryString = params.toString();
  const url = queryString
    ? `${ENDPOINTS.dataRights.healthDataLogs}?${queryString}`
    : ENDPOINTS.dataRights.healthDataLogs;

  const response = await api.get<HealthDataLogsResponse>(url);
  return response.data;
};

// ==================== Data Breach Management ====================

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

/**
 * Create a new data breach (Admin only)
 */
export const createBreach = async (data: CreateBreachDto): Promise<BreachDetailResponse> => {
  const response = await api.post<BreachDetailResponse>(ENDPOINTS.dataRights.breaches, data);
  return response.data;
};

/**
 * Get all data breaches with optional filters (Admin only)
 */
export const getBreaches = async (filters?: BreachFilters): Promise<BreachListResponse> => {
  const params = new URLSearchParams();

  if (filters?.status) {
    params.append('status', filters.status);
  }
  if (filters?.riskLevel) {
    params.append('riskLevel', filters.riskLevel);
  }
  if (filters?.skip !== undefined) {
    params.append('skip', filters.skip.toString());
  }
  if (filters?.take !== undefined) {
    params.append('take', filters.take.toString());
  }

  const queryString = params.toString();
  const url = queryString
    ? `${ENDPOINTS.dataRights.breaches}?${queryString}`
    : ENDPOINTS.dataRights.breaches;

  const response = await api.get<BreachListResponse>(url);
  return response.data;
};

/**
 * Get breach by ID (Admin only)
 */
export const getBreachById = async (id: string): Promise<BreachDetailResponse> => {
  const response = await api.get<BreachDetailResponse>(`${ENDPOINTS.dataRights.breaches}/${id}`);
  return response.data;
};

/**
 * Update breach status (Admin only)
 */
export const updateBreachStatus = async (
  id: string,
  data: UpdateBreachStatusDto,
): Promise<BreachDetailResponse> => {
  const response = await api.patch<BreachDetailResponse>(
    `${ENDPOINTS.dataRights.breaches}/${id}/status`,
    data,
  );
  return response.data;
};

/**
 * Mark breach as reported to DPC (Admin only)
 */
export const reportBreachToDpc = async (
  id: string,
  notes?: string,
): Promise<BreachDetailResponse> => {
  const response = await api.patch<BreachDetailResponse>(
    `${ENDPOINTS.dataRights.breaches}/${id}/report-dpc`,
    { notes },
  );
  return response.data;
};

/**
 * Mark users as notified about breach (Admin only)
 */
export const notifyUsersAboutBreach = async (
  id: string,
  notes?: string,
): Promise<BreachDetailResponse> => {
  const response = await api.patch<BreachDetailResponse>(
    `${ENDPOINTS.dataRights.breaches}/${id}/notify-users`,
    { notes },
  );
  return response.data;
};