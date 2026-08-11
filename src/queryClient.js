import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes fresh time before background refetch
      gcTime: 1000 * 60 * 10,    // 10 minutes cache retention
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});
