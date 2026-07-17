/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('expense_jwt_token'));
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {

    // Listen for global unauthorized/logout events from API layer
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth-unauthorized', handleUnauthorized);
    window.addEventListener('auth-logout', handleUnauthorized);

    return () => {
      window.removeEventListener('auth-unauthorized', handleUnauthorized);
      window.removeEventListener('auth-logout', handleUnauthorized);
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const result = await authService.login(email, password);
      setToken(result.token);
      setUser(result.user);
      return result.user;
    } catch (err) {
      setAuthError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      await authService.register(username, email, password);
    } catch (err) {
      setAuthError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    loading,
    authError,
    login,
    register,
    logout,
    clearError: () => setAuthError(null)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
