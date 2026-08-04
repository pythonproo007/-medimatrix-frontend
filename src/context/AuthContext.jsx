import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shopName, setShopName] = useState(() => {
    return localStorage.getItem('medimatrix_shopname') || 'MediMatrix';
  });

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('medimatrix_token');
      if (token) {
        try {
          const res = await api.get('/api/auth/me');
          if (res.success) {
            setUser(res.user);
          } else {
            localStorage.removeItem('medimatrix_token');
          }
        } catch (err) {
          console.error('[Auth] Failed loading session:', err.message);
          localStorage.removeItem('medimatrix_token');
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (username, password) => {
    try {
      const res = await api.post('/api/auth/login', { username, password });
      if (res.success && res.token) {
        localStorage.setItem('medimatrix_token', res.token);
        setUser(res.user);
        return { success: true };
      }
      return { success: false, error: 'Authentication failed' };
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
        setUser(res.user);
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
    setUser(null);
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
