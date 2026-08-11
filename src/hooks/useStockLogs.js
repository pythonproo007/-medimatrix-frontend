import { useQuery } from '@tanstack/react-query';
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
