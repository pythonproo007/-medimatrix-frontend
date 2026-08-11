import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const usePrescriptions = () => {
  return useQuery({
    queryKey: ['prescriptions'],
    queryFn: async () => {
      const res = await api.get('/api/prescriptions');
      return res.success ? res.data : [];
    }
  });
};

export const useCreatePrescription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rxPayload) => api.post('/api/prescriptions', rxPayload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    }
  });
};

export const useDispensePrescription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ rxId, dispensePayload }) => api.post(`/api/prescriptions/${rxId}/dispense`, dispensePayload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    }
  });
};
