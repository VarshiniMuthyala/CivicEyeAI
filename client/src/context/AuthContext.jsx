import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('civiceye_token'));
  const [loading, setLoading] = useState(true);

  // Initialize user from token on load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('civiceye_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res?.user) {
            setUser(res.user);
          } else {
            logout();
          }
        } catch (err) {
          console.warn('Session expired or invalid, logging out:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res?.token && res?.user) {
      localStorage.setItem('civiceye_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error('Authentication failed');
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res?.token && res?.user) {
      localStorage.setItem('civiceye_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error('Registration failed');
  };

  const quickLogin = async (roleType) => {
    let email = '';
    let password = '';

    if (roleType === 'citizen') {
      email = 'citizen@civiceye.org';
      password = 'citizen123';
    } else if (roleType === 'admin') {
      email = 'admin@civiceye.org';
      password = 'admin123';
    } else if (roleType === 'department') {
      email = 'roads@civiceye.org';
      password = 'staff123';
    }

    return await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('civiceye_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || 'guest',
        isAuthenticated: Boolean(user),
        loading,
        login,
        register,
        quickLogin,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
