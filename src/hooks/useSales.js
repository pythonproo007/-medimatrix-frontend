import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useSales = () => {
  return useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      const res = await api.get('/api/sales');
      return res.success ? res.data : [];
    }
  });
};

export const useSaleDetails = (saleId) => {
  return useQuery({
    queryKey: ['sales', saleId],
    queryFn: async () => {
      if (!saleId) return null;
      const res = await api.get(`/api/sales/${saleId}`);
      return res.success ? res.data : null;
    },
    enabled: !!saleId
  });
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (salePayload) => api.post('/api/sales', salePayload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
    }
  });
};

export const useValidatePromo = () => {
  return useMutation({
    mutationFn: (code) => api.post('/api/offers/validate', { code })
  });
};
