import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';

// Export Types
export interface AdminExportFormData {
  userId?: string;
  email?: string;
  exportAll?: boolean;
  format: 'json' | 'csv';
  requestReference: string;
  purpose: string;
  encrypt: boolean;
}

export interface UserExportFormData {
  format: 'json' | 'csv';
  requestReference?: string;
  purpose?: string;
  encrypt?: boolean;
}

export interface EncryptedExportResponse {
  success: boolean;
  message: string;
  data: {
    encrypted: true;
    data: string; // Base64 encrypted data
    iv: string;
    keyId: string;
    algorithm: string;
    exportKey: string; // Hex-encoded key for this export only (NEW)
    format: 'json' | 'csv';
    metadata: {
      requestReference: string;
      purpose: string;
      exportedAt: string;
      exportedBy: {
        id: string;
        name: string;
        email: string;
      };
      exportedUser: {
        id: string;
        name: string;
        email: string;
      };
    };
  };
}

export interface UnencryptedExportResponse {
  success: boolean;
  message: string;
  data: unknown; // The actual export data
  format: 'json' | 'csv';
}

export type ExportResponse = EncryptedExportResponse | UnencryptedExportResponse;

// File download response type
export interface FileDownloadResponse {
  blob: Blob;
  filename: string;
  contentType: string;
}

// Export Log Types
export interface ExportLog {
  id: string;
  exportedBy: string; // User ID
  exportedUserId: string | null; // User ID
  exportType: 'ADMIN' | 'USER' | 'USER_DATA' | 'BULK_USER_DATA';
  format: 'json' | 'csv' | 'JSON' | 'CSV';
  requestReference: string | null;
  purpose: string;
  isEncrypted: boolean; // API uses isEncrypted, not encrypted
  encryptionKeyId: string | null;
  fileSize: number; // in bytes
  ipAddress?: string;
  userAgent?: string;
  createdAt: string; // API uses createdAt, not exportedAt
  exportedByUser: {
    id: string;
    name: string;
    email: string;
    role?: string;
  } | null;
  exportedUser: {
    id: string;
    name: string;
    email: string;
    role?: string;
  } | null;
  // Legacy fields for backward compatibility
  encrypted?: boolean; // Deprecated: use isEncrypted
  exportedAt?: string; // Deprecated: use createdAt
}

export interface ExportLogFilters {
  exportedBy?: string;
  exportedUserId?: string;
  exportType?: 'ADMIN' | 'USER';
  requestReference?: string;
  startDate?: string;
  endDate?: string;
  skip?: number;
  take?: number;
}

export interface ExportLogsResponse {
  success: boolean;
  message: string;
  data: ExportLog[];
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
 * Extract filename from Content-Disposition header
 */
const extractFilenameFromHeader = (
  contentDisposition: string | null,
  defaultFormat: 'json' | 'csv',
  requestReference?: string,
): string => {
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (filenameMatch?.[1]) {
      return filenameMatch[1].replace(/['"]/g, '');
    }
  }
  // Fallback filename
  const extension = defaultFormat === 'csv' ? 'csv' : 'json';
  const timestamp = new Date().toISOString().split('T')[0];
  return requestReference
    ? `user-data-${requestReference}-${timestamp}.${extension}`
    : `user-data-${timestamp}.${extension}`;
};

/**
 * Admin export user data (for DPC requests)
 * Returns a file download (blob) instead of JSON
 */
export const adminExportUserData = async (
  data: AdminExportFormData,
): Promise<FileDownloadResponse> => {
  // Transform data to match backend API format
  const payload: {
    format: 'json' | 'csv';
    requestReference?: string;
    purpose?: string;
    encrypt?: boolean;
    exportAll?: boolean;
    userId?: string;
    userEmail?: string;
  } = {
    format: data.format,
    requestReference: data.requestReference,
    purpose: data.purpose,
    encrypt: data.encrypt,
    exportAll: data.exportAll || false,
  };

  // Add userId if provided
  if (data.userId) {
    payload.userId = data.userId;
  }

  // Add userEmail if provided (backend expects userEmail, not email)
  if (data.email) {
    payload.userEmail = data.email;
  }

  try {
    const response = await api.post<Blob>(ENDPOINTS.dataRights.adminExport, payload, {
      responseType: 'blob',
    });

    // Extract filename from Content-Disposition header
    // Axios normalizes headers to lowercase
    const contentDisposition = (response.headers['content-disposition'] ||
      response.headers['Content-Disposition'] ||
      null) as string | null;
    const contentType = String(
      response.headers['content-type'] || response.headers['Content-Type'] || '',
    );
    const filename = extractFilenameFromHeader(
      contentDisposition,
      data.format,
      data.requestReference,
    );

    return {
      blob: response.data,
      filename,
      contentType,
    };
  } catch (error: unknown) {
    // If error response is JSON, try to parse it
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response?: { data?: Blob } };
      if (apiError.response?.data && apiError.response.data instanceof Blob) {
        const errorText = await apiError.response.data.text();
        try {
          const errorJson = JSON.parse(errorText) as { message?: string };
          throw new Error(errorJson.message || 'Export failed');
        } catch {
          throw new Error(errorText || 'Export failed');
        }
      }
    }
    throw error;
  }
};

/**
 * Get export audit logs (Admin only)
 */
export const getExportLogs = async (filters?: ExportLogFilters): Promise<ExportLogsResponse> => {
  const params = new URLSearchParams();

  if (filters?.exportedBy) {
    params.append('exportedBy', filters.exportedBy);
  }
  if (filters?.exportedUserId) {
    params.append('exportedUserId', filters.exportedUserId);
  }
  if (filters?.exportType) {
    params.append('exportType', filters.exportType);
  }
  if (filters?.requestReference) {
    params.append('requestReference', filters.requestReference);
  }
  if (filters?.startDate) {
    params.append('startDate', filters.startDate);
  }
  if (filters?.endDate) {
    params.append('endDate', filters.endDate);
  }
  if (filters?.skip !== undefined) {
    params.append('skip', filters.skip.toString());
  }
  if (filters?.take !== undefined) {
    params.append('take', filters.take.toString());
  }

  const queryString = params.toString();
  const url = queryString
    ? `${ENDPOINTS.dataRights.adminExportLogs}?${queryString}`
    : ENDPOINTS.dataRights.adminExportLogs;

  const response = await api.get<ExportLogsResponse>(url);
  return response.data;
};

/**
 * Export export logs as CSV (Admin only)
 * Returns a CSV file directly from the backend
 */
export const exportExportLogsToCSV = async (filters?: ExportLogFilters): Promise<Blob> => {
  const params = new URLSearchParams();

  if (filters?.exportedBy) {
    params.append('exportedBy', filters.exportedBy);
  }
  if (filters?.exportedUserId) {
    params.append('exportedUserId', filters.exportedUserId);
  }
  if (filters?.exportType) {
    params.append('exportType', filters.exportType);
  }
  if (filters?.requestReference) {
    params.append('requestReference', filters.requestReference);
  }
  if (filters?.startDate) {
    params.append('startDate', filters.startDate);
  }
  if (filters?.endDate) {
    params.append('endDate', filters.endDate);
  }
  if (filters?.skip !== undefined) {
    params.append('skip', filters.skip.toString());
  }
  if (filters?.take !== undefined) {
    params.append('take', filters.take.toString());
  }

  const queryString = params.toString();
  const url = queryString
    ? `${ENDPOINTS.dataRights.adminExportLogs}/csv?${queryString}`
    : `${ENDPOINTS.dataRights.adminExportLogs}/csv`;

  const response = await api.get<Blob>(url, {
    responseType: 'blob',
  });
  return response.data;
};

/**
 * Export user's own data (self-service with optional encryption)
 */
export const exportMyData = async (data: UserExportFormData): Promise<ExportResponse> => {
  const params = new URLSearchParams();
  params.append('format', data.format);

  if (data.requestReference) {
    params.append('requestReference', data.requestReference);
  }
  if (data.purpose) {
    params.append('purpose', data.purpose);
  }
  if (data.encrypt !== undefined) {
    params.append('encrypt', data.encrypt.toString());
  }

  const response = await api.get<ExportResponse>(
    `${ENDPOINTS.dataRights.exportPortable}?${params.toString()}`,
  );
  return response.data;
};

/**
 * Download file from blob
 */
export const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

/**
 * Check if downloaded file is encrypted by reading its content
 */
export const checkIfEncrypted = async (
  blob: Blob,
): Promise<{
  isEncrypted: boolean;
  encryptedData?: EncryptedExportResponse['data'];
}> => {
  try {
    // Read blob as text
    const text = await blob.text();

    // Try to parse as JSON
    const parsed = JSON.parse(text);

    // Check if it has the encrypted structure
    if (
      parsed &&
      typeof parsed === 'object' &&
      parsed.encrypted === true &&
      parsed.data &&
      parsed.iv &&
      parsed.keyId
    ) {
      return {
        isEncrypted: true,
        encryptedData: parsed as EncryptedExportResponse['data'],
      };
    }

    return { isEncrypted: false };
  } catch {
    // If parsing fails, it's not encrypted JSON
    return { isEncrypted: false };
  }
};

/**
 * Helper function to convert hex string to Uint8Array
 */
export const hexToUint8Array = (hex: string): Uint8Array => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return new Uint8Array(bytes.buffer);
};

/**
 * Helper function to convert base64 string to Uint8Array
 */
export const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Uint8Array(bytes.buffer);
};

/**
 * Decrypt exported file using exportKey from the file
 */
export const decryptExportedFile = async (encryptedFileBlob: Blob): Promise<string> => {
  // 1. Read the file content
  const fileContent = await encryptedFileBlob.text();
  const encryptedData = JSON.parse(fileContent);

  // 2. Check if it's encrypted
  if (!encryptedData.encrypted || !encryptedData.exportKey) {
    throw new Error('File is not encrypted or missing export key');
  }

  // 3. Extract components
  const exportKeyBytes = hexToUint8Array(encryptedData.exportKey);
  const ivBytes = base64ToUint8Array(encryptedData.iv);
  const encryptedBuffer = base64ToUint8Array(encryptedData.data);

  // 4. Extract auth tag (last 16 bytes) and encrypted data
  const authTag = encryptedBuffer.slice(-16);
  const encryptedDataOnly = encryptedBuffer.slice(0, -16);

  // Create new ArrayBuffer instances to avoid type issues
  const exportKeyBuffer: ArrayBuffer = new ArrayBuffer(exportKeyBytes.length);
  new Uint8Array(exportKeyBuffer).set(exportKeyBytes);

  const ivBuffer: ArrayBuffer = new ArrayBuffer(ivBytes.length);
  new Uint8Array(ivBuffer).set(ivBytes);

  // 5. Decrypt using Web Crypto API
  const key = await crypto.subtle.importKey(
    'raw',
    exportKeyBuffer as BufferSource,
    { name: 'AES-GCM' },
    false,
    ['decrypt'],
  );

  // Combine encrypted data with auth tag for Web Crypto API
  const encryptedWithTag = new Uint8Array(encryptedDataOnly.length + authTag.length);
  encryptedWithTag.set(encryptedDataOnly);
  encryptedWithTag.set(authTag, encryptedDataOnly.length);

  // Decrypt
  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBuffer as BufferSource,
      tagLength: 128, // 16 bytes = 128 bits
    },
    key,
    encryptedWithTag as BufferSource,
  );

  // Convert to string
  return new TextDecoder().decode(decrypted);
};

/**
 * Download encrypted export as file (legacy - for when we have the data object)
 */
export const downloadEncryptedExport = (exportData: EncryptedExportResponse['data']) => {
  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json',
  });
  downloadFile(blob, `encrypted-export-${exportData.metadata.requestReference}-${Date.now()}.json`);
};

/**
 * Download unencrypted export as file (legacy - for when we have the data object)
 */
export const downloadUnencryptedExport = (
  data: unknown,
  format: 'json' | 'csv',
  requestReference?: string,
) => {
  let blob: Blob;
  let filename: string;

  if (format === 'json') {
    blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    filename = requestReference
      ? `export-${requestReference}-${Date.now()}.json`
      : `export-${Date.now()}.json`;
  } else {
    // For CSV, use the data as-is (it should already be CSV string)
    blob = new Blob([typeof data === 'string' ? data : JSON.stringify(data, null, 2)], {
      type: 'text/csv',
    });
    filename = requestReference
      ? `export-${requestReference}-${Date.now()}.csv`
      : `export-${Date.now()}.csv`;
  }

  downloadFile(blob, filename);
};
