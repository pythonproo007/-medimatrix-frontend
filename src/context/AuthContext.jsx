import React, { createContext, useState, useContext } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [token, setToken] = useState(() => localStorage.getItem('medimatrix_token'));
  const [shopName, setShopName] = useState(() => {
    return localStorage.getItem('medimatrix_shopname') || 'MediMatrix';
  });

  const { data: userData, isLoading: loading } = useQuery({
    queryKey: ['auth', 'me', token],
    queryFn: async () => {
      if (!token) return null;
      try {
        const res = await api.get('/api/auth/me');
        if (res.success) return res.user;
        localStorage.removeItem('medimatrix_token');
        setToken(null);
        return null;
      } catch (err) {
        console.error('[Auth] Failed loading session:', err.message);
        localStorage.removeItem('medimatrix_token');
        setToken(null);
        return null;
      }
    },
    enabled: !!token
  });

  const user = userData || null;

  const login = async (username, password) => {
    try {
      const res = await api.post('/api/auth/login', { username, password });
      if (res.success && res.token) {
        localStorage.setItem('medimatrix_token', res.token);
        setToken(res.token);
        queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
        return { success: true };
      }
      return { success: false, error: res.error || 'Authentication failed' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const registerUser = async (formData) => {
    try {
      const res = await api.post('/api/auth/register', formData);
      return res;
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const updateProfile = async (formData) => {
    try {
      const res = await api.put('/api/auth/update-profile', formData);
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      }
      return res;
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const forgotPassword = async (username, email, newPassword) => {
    try {
      const res = await api.post('/api/auth/forgot-password', { username, email, newPassword });
      return res;
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const updateShopName = (name) => {
    const newName = name.trim() || 'MediMatrix';
    setShopName(newName);
    localStorage.setItem('medimatrix_shopname', newName);
  };

  const logout = () => {
    localStorage.removeItem('medimatrix_token');
    setToken(null);
    queryClient.setQueryData(['auth', 'me'], null);
    queryClient.clear();
  };

  return (
    <AuthContext.Provider value={{ user, loading, shopName, updateShopName, login, registerUser, updateProfile, forgotPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
};
