import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import { getApiErrorMessage } from '@/types/common';
import { PaymentMethodsResponse } from '@/types/invoice';

export const usePaymentMethods = () => {
  return useQuery({
    queryKey: ['paymentMethods'],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: PaymentMethodsResponse }>(
        ENDPOINTS.subscription.paymentMethods,
      );
      return response.data.data;
    },
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useUpdatePaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentMethodId: string) => {
      const response = await api.put<{ success: boolean; message: string }>(
        ENDPOINTS.subscription.updatePaymentMethod,
        { paymentMethodId },
      );
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
      toast.success('Payment method updated successfully');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to update payment method');
    },
  });
};
