"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { api } from '@/lib/api';
import { getToken, setToken, removeToken } from '@/lib/auth';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin' | 'team_member';
  subscription?: {
    plan: string;
    status: string;
    trialEndsAt?: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  isAuthenticated: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth token and fetch user data
    const token = getToken();
    
    if (token) {
      try {
        // Fetch current user data from API
        api.get('/users/me').then(response => {
          setUser(response.data);
          setLoading(false);
        }).catch(() => {
          removeToken();
          setLoading(false);
        });
      } catch (error) {
        removeToken();
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user } = response.data;
      
      setToken(access_token);
      setUser(user);
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await api.post('/auth/register', data);
      const { access_token, user } = response.data;
      
      setToken(access_token);
      setUser(user);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    try {
      await api.post('/auth/reset-password', { email });
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      resetPassword,
      isAuthenticated: !!user,
    }}>
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