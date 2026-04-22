import { QueryClient } from '@tanstack/react-query';

/**
 * Shared React Query client instance.
 *
 * Kept as a module-level singleton so non-React code (zustand auth store,
 * api interceptors) can access the same cache as the React tree. The most
 * important non-React use case is clearing the cache on logout so stale
 * data from a previous user never leaks into the next login.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
