import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useStockLogs = (params = {}) => {
  const { transactionType, search } = typeof params === 'string' ? { transactionType: params } : params;
  
  return useQuery({
    queryKey: ['stockLogs', { transactionType: transactionType || '', search: search || '' }],
    queryFn: async () => {
      let url = '/api/stock-logs';
      const queryParams = new URLSearchParams();
      if (transactionType && transactionType !== 'all') queryParams.append('transactionType', transactionType);
      if (search) queryParams.append('search', search);
      
      const queryString = queryParams.toString();
      if (queryString) url += `?${queryString}`;
      
      const res = await api.get(url);
      return res.success ? res.data : [];
    }
  });
};

export const useStockLevels = () => {
  return useQuery({
    queryKey: ['stockLevels'],
    queryFn: async () => {
      const res = await api.get('/api/stock/levels');
      return res.success ? res.data : [];
    }
  });
};

export const useUpdateStockItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await api.put(`/api/stock/${id}`, data);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockLevels'] });
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['stockLogs'] });
    }
  });
};
