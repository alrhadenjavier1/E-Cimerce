// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

interface AuthContextType {
  account: any | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  confirmAccount: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { account, isAuthenticated } = await authService.getCurrentSession();
    setAccount(isAuthenticated ? account : null);
    setLoading(false);
  };

  const login = async (email: string, password: string) => {
    const result = await authService.login(email, password);
    if (result.success) {
      await checkAuth();
    }
    return result;
  };

  const register = async (email: string, password: string, fullName: string) => {
    return await authService.register(email, password, fullName);
  };

  const logout = async () => {
    await authService.logout();
    setAccount(null);
  };

  const confirmAccount = async (email: string, code: string) => {
    return await authService.confirmAccount(email, code);
  };

  return (
    <AuthContext.Provider value={{
      account,
      isAuthenticated: !!account,
      loading,
      login,
      register,
      logout,
      confirmAccount
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};