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
  };
  accessedByUser: {
    id: string;
    name: string;
    email: string;
  };
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
 */
export const getHealthDataConsent = async (): Promise<HealthDataConsentStatusResponse> => {
  const response = await api.get<HealthDataConsentStatusResponse>(ENDPOINTS.consent.healthData);
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
