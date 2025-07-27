"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

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
    // Check for existing auth token
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Mock API call - replace with actual API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error('Login failed');

      const data = await response.json();
      
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(data.user));
      setUser(data.user);
    } catch (error) {
      // For demo purposes, simulate login
      const mockUser: User = {
        id: '1',
        email,
        firstName: 'John',
        lastName: 'Doe',
        role: email.includes('admin') ? 'admin' : 'user',
        subscription: {
          plan: 'growth',
          status: 'active',
          trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
      };
      
      localStorage.setItem('auth_token', 'mock_token');
      localStorage.setItem('user_data', JSON.stringify(mockUser));
      setUser(mockUser);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      // Mock API call - replace with actual API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Registration failed');

      const result = await response.json();
      
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('user_data', JSON.stringify(result.user));
      setUser(result.user);
    } catch (error) {
      // For demo purposes, simulate registration
      const mockUser: User = {
        id: '1',
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'user',
        subscription: {
          plan: 'starter',
          status: 'trial',
          trialEndsAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        },
      };
      
      localStorage.setItem('auth_token', 'mock_token');
      localStorage.setItem('user_data', JSON.stringify(mockUser));
      setUser(mockUser);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    // Mock API call - replace with actual API
    await new Promise(resolve => setTimeout(resolve, 1000));
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