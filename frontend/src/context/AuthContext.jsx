import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { apiClient } from '../api/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      localStorage.removeItem('auth_user');
      apiClient.setToken(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const response = await authApi.login(email, password);
      if (response?.success && response.data) {
        const userData = response.data;
        apiClient.setToken(userData.token);
        setUser(userData);
        localStorage.setItem('auth_user', JSON.stringify(userData));
        return { success: true, user: userData };
      } else {
        throw new Error(response?.message || 'Login failed');
      }
    } catch (err) {
      const msg = err.message || 'Invalid email or password';
      setAuthError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    setAuthError(null);
    try {
      const response = await authApi.register(formData);
      if (response?.success && response.data) {
        const userData = response.data;
        apiClient.setToken(userData.token);
        setUser(userData);
        localStorage.setItem('auth_user', JSON.stringify(userData));
        return { success: true, user: userData };
      } else {
        throw new Error(response?.message || 'Registration failed');
      }
    } catch (err) {
      const msg = err.message || 'Registration failed';
      setAuthError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
    apiClient.setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role,
        isFaculty: user?.role === 'FACULTY',
        isStudent: user?.role === 'STUDENT',
        isAdmin: user?.role === 'ADMIN',
        loading,
        authError,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
