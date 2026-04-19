"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';
import Cookies from 'js-cookie';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for cookie session first (set by server)
    const cookieUser = Cookies.get('auth_token');
    if (cookieUser) {
      try {
        setUser(JSON.parse(cookieUser));
      } catch (e) {
        console.error("Error parsing auth cookie", e);
      }
    } else {
      // Fallback to localStorage (legacy support during migration)
      const storedUser = localStorage.getItem('dp_auth');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const authenticatedUser = await response.json();
        setUser(authenticatedUser);
        localStorage.setItem('dp_auth', JSON.stringify(authenticatedUser));
        return { success: true };
      }

      const data = await response.json().catch(() => ({}));
      return { success: false, message: data.error };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('dp_auth');
    Cookies.remove('auth_token');
    
    // Force reload to clear server-side context if needed, or just redirect
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
