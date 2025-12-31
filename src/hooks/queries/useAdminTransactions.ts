import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import adminTransactionService from '@/services/adminTransactionService';
import { getApiErrorMessage } from '@/types/common';
import { TransactionFilters } from '@/types/transaction';

export const useAdminTransactions = (filters?: TransactionFilters) => {
  return useQuery({
    queryKey: ['adminTransactions', filters],
    queryFn: () => adminTransactionService.getTransactions(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useTransactionDetails = (transactionId: string | null) => {
  return useQuery({
    queryKey: ['adminTransaction', transactionId],
    queryFn: () =>
      transactionId ? adminTransactionService.getTransactionDetails(transactionId) : null,
    enabled: !!transactionId,
  });
};

export const useTransactionInvoice = (transactionId: string | null) => {
  return useQuery({
    queryKey: ['adminTransactionInvoice', transactionId],
    queryFn: () =>
      transactionId ? adminTransactionService.getTransactionInvoice(transactionId) : null,
    enabled: !!transactionId,
  });
};

export const useTransactionStats = (
  filters?: Pick<TransactionFilters, 'dateFrom' | 'dateTo' | 'freelancerId'>,
) => {
  return useQuery({
    queryKey: ['adminTransactionStats', filters],
    queryFn: () => adminTransactionService.getTransactionStats(filters),
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useExportTransactions = () => {
  return useMutation({
    mutationFn: async ({
      filters,
      format,
    }: {
      filters?: TransactionFilters;
      format?: 'csv' | 'pdf';
    }) => {
      const blob = await adminTransactionService.exportTransactions(filters, format);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transactions-${new Date().toISOString()}.${format || 'csv'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return blob;
    },
    onSuccess: () => {
      toast.success('Transactions exported successfully');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to export transactions');
    },
  });
};
