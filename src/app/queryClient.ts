import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Don't retry 4xx responses — a 401/403/404 won't change on retry, so
      // retrying just wastes requests (and spammed the logs for permission-
      // gated endpoints like attendance/timesheet). Still retry 5xx/network.
      retry: (failureCount, error: any) => {
        const status = error?.response?.status;
        if (status && status >= 400 && status < 500) return false;
        return failureCount < 2;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000,   // 10 minutes (formerly cacheTime)
    },
  },
});
