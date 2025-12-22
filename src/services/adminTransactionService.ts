import { AdminTransaction, TransactionFilters, TransactionStats } from '@/types/transaction';

import api from './api';
import { ENDPOINTS } from './endpoints';

export interface AdminTransactionsResponse {
  success: boolean;
  data: {
    transactions: AdminTransaction[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface TransactionStatsResponse {
  success: boolean;
  data: TransactionStats;
}

export interface TransactionDetailsResponse {
  success: boolean;
  data: AdminTransaction;
}

export interface TransactionInvoiceResponse {
  success: boolean;
  data: {
    invoiceId: string;
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
    status: string;
    subtotal: number;
    tax: number;
    total: number;
    currency: string;
    invoicePdf?: string;
    hostedInvoiceUrl?: string;
    lineItems: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }>;
    planName: string;
    periodStart: string;
    periodEnd: string;
    freelancer: {
      id: string;
      name: string;
      email: string;
    };
  };
}

const adminTransactionService = {
  // Get all transactions with filters
  getTransactions: async (filters?: TransactionFilters) => {
    const params = new URLSearchParams();
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.plan && filters.plan !== 'all') params.append('plan', filters.plan);
    if (filters?.freelancerId) params.append('freelancerId', filters.freelancerId);
    if (filters?.paymentMethod && filters.paymentMethod !== 'all')
      params.append('paymentMethod', filters.paymentMethod);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await api.get<AdminTransactionsResponse>(
      `${ENDPOINTS.admin.finance.getTransactions}?${params.toString()}`,
    );
    return response.data.data;
  },

  // Get transaction details
  getTransactionDetails: async (transactionId: string) => {
    const response = await api.get<TransactionDetailsResponse>(
      ENDPOINTS.admin.finance.getTransactionDetails(transactionId),
    );
    return response.data.data;
  },

  // Get transaction invoice
  getTransactionInvoice: async (transactionId: string) => {
    const response = await api.get<TransactionInvoiceResponse>(
      ENDPOINTS.admin.finance.getTransactionInvoice(transactionId),
    );
    return response.data.data;
  },

  // Get transaction statistics
  getTransactionStats: async (
    filters?: Pick<TransactionFilters, 'dateFrom' | 'dateTo' | 'freelancerId'>,
  ) => {
    const params = new URLSearchParams();
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.freelancerId) params.append('freelancerId', filters.freelancerId);

    const response = await api.get<TransactionStatsResponse>(
      `${ENDPOINTS.admin.finance.transactionStats}?${params.toString()}`,
    );
    return response.data.data;
  },

  // Export transactions
  exportTransactions: async (filters?: TransactionFilters, format: 'csv' | 'pdf' = 'csv') => {
    const params = new URLSearchParams();
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.plan && filters.plan !== 'all') params.append('plan', filters.plan);
    if (filters?.freelancerId) params.append('freelancerId', filters.freelancerId);
    if (filters?.paymentMethod && filters.paymentMethod !== 'all')
      params.append('paymentMethod', filters.paymentMethod);
    if (filters?.search) params.append('search', filters.search);
    params.append('format', format);

    const response = await api.get(
      `${ENDPOINTS.admin.finance.exportTransactions}?${params.toString()}`,
      {
        responseType: 'blob',
      },
    );
    return response.data;
  },
};

export default adminTransactionService;
