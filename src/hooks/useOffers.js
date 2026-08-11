import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useOffers = () => {
  return useQuery({
    queryKey: ['offers'],
    queryFn: async () => {
      const res = await api.get('/api/offers');
      return res.success ? res.data : [];
    }
  });
};

export const useCreateOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (offerPayload) => api.post('/api/offers', offerPayload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    }
  });
};

export const useBroadcastOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (offerId) => api.post(`/api/offers/${offerId}/broadcast`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    }
  });
};
