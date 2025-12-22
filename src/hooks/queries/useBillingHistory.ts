import { useInfiniteQuery } from '@tanstack/react-query';

import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import { BillingHistoryItem, BillingHistoryResponse } from '@/types/invoice';

export const useBillingHistory = (limit = 10) => {
  return useInfiniteQuery({
    queryKey: ['billingHistory', limit],
    queryFn: async ({ pageParam }: { pageParam?: string }) => {
      const params: Record<string, string | number> = { limit };
      if (pageParam) {
        params.starting_after = pageParam;
      }

      const response = await api.get<{ success: boolean; data: BillingHistoryResponse }>(
        ENDPOINTS.subscription.billingHistory,
        { params },
      );
      return response.data.data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore && lastPage.items.length > 0
        ? lastPage.items[lastPage.items.length - 1].invoiceId
        : undefined;
    },
    initialPageParam: undefined as string | undefined,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Helper hook for flat list of all items
export const useBillingHistoryFlat = (limit = 10) => {
  const query = useBillingHistory(limit);
  const allItems: BillingHistoryItem[] = query.data?.pages.flatMap((page) => page.items) || [];
  return {
    ...query,
    data: allItems,
    total: query.data?.pages[0]?.total || 0,
    hasMore: query.data?.pages[query.data.pages.length - 1]?.hasMore || false,
  };
};
