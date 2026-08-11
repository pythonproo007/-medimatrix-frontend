import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const res = await api.get('/api/dashboard/stats');
      return res.success ? res.data : null;
    },
    refetchInterval: 20000 // Automatically refresh every 20s
  });
};
