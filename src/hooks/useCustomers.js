import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useCustomers = (search = '') => {
  return useQuery({
    queryKey: ['customers', { search }],
    queryFn: async () => {
      let url = '/api/customers';
      if (search) url += `?search=${encodeURIComponent(search)}`;
      const res = await api.get(url);
      return res.success ? res.data : [];
    }
  });
};

export const useCustomerHistory = (customerId) => {
  return useQuery({
    queryKey: ['customers', customerId, 'history'],
    queryFn: async () => {
      if (!customerId) return null;
      const res = await api.get(`/api/customers/${customerId}/history`);
      return res.success ? res.data : null;
    },
    enabled: !!customerId
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData) => api.post('/api/customers', formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    }
  });
};

export const useToggleRegularCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.put(`/api/customers/${id}/toggle-regular`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    }
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/api/customers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    }
  });
};
