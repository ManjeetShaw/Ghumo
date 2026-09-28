import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('foxico_auth_token') || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user on mount or token change
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const res = await authApi.me();
        if (res.success && res.data?.user) {
          setUser(res.data.user);
          localStorage.setItem('foxico_user_role', res.data.user.role || 'USER');
        } else {
          // Token expired or invalid
          setUser(null);
          setToken(null);
          localStorage.removeItem('foxico_auth_token');
          localStorage.removeItem('foxico_user_role');
        }
      } catch (err) {
        console.error('Failed to load authenticated user profile:', err);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.success && res.data?.token) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('foxico_auth_token', res.data.token);
      localStorage.setItem('foxico_user_role', res.data.user?.role || 'USER');
      return { success: true, user: res.data.user };
    }
    return { success: false, error: res.error?.message || 'Login failed' };
  };

  const register = async ({ name, email, password, phone, preferences }) => {
    const res = await authApi.register({ name, email, password, phone });
    if (res.success && res.data?.token) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('foxico_auth_token', res.data.token);
      localStorage.setItem('foxico_user_role', res.data.user?.role || 'USER');

      if (preferences) {
        try {
          await authApi.updateProfile({ preferences });
        } catch (e) {
          // ignore preference sync error
        }
      }
      return { success: true, user: res.data.user };
    }
    return { success: false, error: res.error?.message || 'Registration failed' };
  };

  const updateProfile = async (updates) => {
    const res = await authApi.updateProfile(updates);
    if (res.success && res.data?.user) {
      setUser(res.data.user);
      return { success: true, user: res.data.user };
    }
    return { success: false, error: res.error?.message || 'Update failed' };
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('foxico_auth_token');
    localStorage.removeItem('foxico_user_role');
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await authApi.me();
      if (res.success && res.data?.user) {
        setUser(res.data.user);
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated: !!token,
        login,
        register,
        updateProfile,
        logout,
        refreshUser
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
