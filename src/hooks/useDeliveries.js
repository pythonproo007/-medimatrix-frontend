import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useDeliveries = () => {
  return useQuery({
    queryKey: ['deliveries'],
    queryFn: async () => {
      const res = await api.get('/api/deliveries');
      return res.success ? res.data : [];
    }
  });
};

export const useUpdateDeliveryStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ deliveryId, status, notes }) => api.put(`/api/deliveries/${deliveryId}/status`, { status, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    }
  });
};
