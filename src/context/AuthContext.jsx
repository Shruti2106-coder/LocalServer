import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [providerProfile, setProviderProfile] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('localserve_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const storedToken = localStorage.getItem('localserve_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.success) {
          setUser(res.user);
          setProviderProfile(res.providerProfile);
        } else {
          logout();
        }
      } catch (err) {
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success) {
      localStorage.setItem('localserve_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setProviderProfile(res.providerProfile);
    }
    return res;
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    if (res.success) {
      localStorage.setItem('localserve_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setProviderProfile(res.providerProfile);
    }
    return res;
  };

  const switchDemoRole = async (role) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/demo-login', { role });
      if (res.success) {
        localStorage.setItem('localserve_token', res.token);
        setToken(res.token);
        setUser(res.user);
        setProviderProfile(res.providerProfile);
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('localserve_token');
    setToken(null);
    setUser(null);
    setProviderProfile(null);
  };

  const refreshMe = async () => {
    if (!token) return;
    try {
      const res = await api.get('/auth/me');
      if (res.success) {
        setUser(res.user);
        setProviderProfile(res.providerProfile);
      }
    } catch (e) {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        providerProfile,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        switchDemoRole,
        refreshMe
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
