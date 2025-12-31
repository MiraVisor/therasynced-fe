import { getDecodedToken } from '@/lib/utils';
import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import type {
  AdminHealthDataLogsFilters,
  BreachDetailResponse,
  BreachFilters,
  BreachListResponse,
  CookieConsentRequest,
  CookieConsentResponse,
  CreateBreachDto,
  DataExportResponse,
  DataRightsStatusResponse,
  DeleteAccountResponse,
  HealthDataConsentRequest,
  HealthDataConsentResponse,
  HealthDataConsentStatusResponse,
  HealthDataLogsFilters,
  HealthDataLogsResponse,
  ObjectProcessingRequest,
  ObjectProcessingResponse,
  RestrictProcessingRequest,
  RestrictProcessingResponse,
  UpdateBreachStatusDto,
} from '@/types/dataRights';

// Data Rights Status
export const getDataRightsStatus = async (): Promise<DataRightsStatusResponse> => {
  const response = await api.get<DataRightsStatusResponse>(ENDPOINTS.dataRights.status);
  return response.data;
};

// Export User Data
export const exportUserData = async (): Promise<DataExportResponse> => {
  const response = await api.get<DataExportResponse>(ENDPOINTS.dataRights.export);
  return response.data;
};

export const exportDataPortable = async (
  format: 'json' | 'csv' = 'json',
): Promise<DataExportResponse | string> => {
  const response = await api.get<DataExportResponse | string>(
    `${ENDPOINTS.dataRights.exportPortable}?format=${format}`,
  );
  return response.data;
};

// Delete Account
export const deleteAccount = async (password?: string): Promise<DeleteAccountResponse> => {
  const response = await api.delete<DeleteAccountResponse>(ENDPOINTS.dataRights.deleteAccount, {
    data: password ? { password } : undefined,
  });
  return response.data;
};

// Restrict Processing
export const restrictProcessing = async (
  data: RestrictProcessingRequest,
): Promise<RestrictProcessingResponse> => {
  const response = await api.post<RestrictProcessingResponse>(
    ENDPOINTS.dataRights.restrictProcessing,
    data,
  );
  return response.data;
};

// Object to Processing
export const objectToProcessing = async (
  data: ObjectProcessingRequest,
): Promise<ObjectProcessingResponse> => {
  const response = await api.post<ObjectProcessingResponse>(
    ENDPOINTS.dataRights.objectProcessing,
    data,
  );
  return response.data;
};

// Health Data Consent
export const updateHealthDataConsent = async (
  data: HealthDataConsentRequest,
): Promise<HealthDataConsentResponse> => {
  const response = await api.post<HealthDataConsentResponse>(ENDPOINTS.consent.healthData, data);
  return response.data;
};

export const getHealthDataConsent = async (
  userId?: string,
): Promise<HealthDataConsentStatusResponse> => {
  let targetUserId = userId;
  if (!targetUserId) {
    const decodedToken = getDecodedToken();
    if (!decodedToken?.sub) {
      throw new Error('Unable to get current user ID. Please ensure you are logged in.');
    }
    targetUserId = decodedToken.sub;
  }

  const response = await api.get<HealthDataConsentStatusResponse>(ENDPOINTS.consent.healthData, {
    params: {
      userId: targetUserId,
    },
  });
  return response.data;
};

// Cookie Consent
export const storeCookieConsent = async (
  data: CookieConsentRequest,
): Promise<CookieConsentResponse> => {
  const response = await api.post<CookieConsentResponse>(ENDPOINTS.consent.cookies, data);
  return response.data;
};

// Health Data Logs
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

// Data Breach Management
export const createBreach = async (data: CreateBreachDto): Promise<BreachDetailResponse> => {
  const response = await api.post<BreachDetailResponse>(ENDPOINTS.dataRights.breaches, data);
  return response.data;
};

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

export const getBreachById = async (id: string): Promise<BreachDetailResponse> => {
  const response = await api.get<BreachDetailResponse>(`${ENDPOINTS.dataRights.breaches}/${id}`);
  return response.data;
};

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
