import React, { createContext, useContext, useEffect, useState } from 'react';
import * as authService from '../features/auth/services/authService';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('user');
      if (storedToken) setAccessToken(storedToken);
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    // keep axios/default in sync for immediate requests
    try {
      if (accessToken) {
        api.defaults.headers = api.defaults.headers || {};
        api.defaults.headers.Authorization = `Bearer ${accessToken}`;
      } else if (api.defaults.headers) {
        delete api.defaults.headers.Authorization;
      }
    } catch (e) {}
  }, [accessToken]);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    try {
      if (data?.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        setAccessToken(data.accessToken);
      }
      if (data?.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        const userId = data.user.id || data.user._id;
        if (userId && data.user.role === 'restaurant') {
          localStorage.setItem('restaurantId', userId);
        }
      }
    } catch (e) {}
    return data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      // ignore errors
    }
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('restaurantId');
    } catch (e) {}
    setUser(null);
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, accessToken, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
