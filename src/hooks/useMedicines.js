import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useMedicines = (params = {}) => {
  const { filterAlert, search, category } = params;
  return useQuery({
    queryKey: ['medicines', { filterAlert: filterAlert || 'all', search: search || '', category: category || '' }],
    queryFn: async () => {
      let url = '/api/medicines';
      const queryParams = new URLSearchParams();
      if (filterAlert && filterAlert !== 'all') queryParams.append('filterAlert', filterAlert);
      if (search) queryParams.append('search', search);
      if (category) queryParams.append('category', category);
      
      const queryString = queryParams.toString();
      if (queryString) url += `?${queryString}`;
      
      const res = await api.get(url);
      return res.success ? res.data : [];
    }
  });
};

export const useMedicineCategories = () => {
  return useQuery({
    queryKey: ['medicines', 'categories'],
    queryFn: async () => {
      const res = await api.get('/api/medicines/categories');
      return res.success ? res.data : [];
    }
  });
};

export const useMedicineTypes = () => {
  return useQuery({
    queryKey: ['medicines', 'types'],
    queryFn: async () => {
      const res = await api.get('/api/medicines/types');
      return res.success ? res.data : [];
    }
  });
};

export const useCreateMedicine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData) => api.post('/api/medicines', formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    }
  });
};

export const useUpdateMedicine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) => api.put(`/api/medicines/${id}`, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    }
  });
};

export const useDeleteMedicine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/api/medicines/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    }
  });
};

export const useStockIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, quantity, note }) => api.post(`/api/medicines/${id}/stock-in`, { quantity: Number(quantity), note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['stockLogs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    }
  });
};

export const useStockOut = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, quantity, reason }) => api.post(`/api/medicines/${id}/stock-out`, { quantity: Number(quantity), reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['stockLogs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    }
  });
};

export const useAddCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name) => api.post('/api/medicines/categories', { name, description: 'Custom medicine category' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines', 'categories'] });
    }
  });
};

export const useAddType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name) => api.post('/api/medicines/types', { name, description: 'Custom dosage form type' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines', 'types'] });
    }
  });
};
