// src/hooks/useAuth.ts (Updated for custom auth)
import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    setLoading(true);
    const { account, isAuthenticated } = await authService.getCurrentSession();
    if (isAuthenticated && account) {
      setUser(account);
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const result = await authService.register(email, password, fullName);
    if (result.success) {
      // Don't auto-login, need confirmation first
      return { data: { user: null }, error: null };
    }
    return { data: null, error: new Error(result.error) };
  };

  const signIn = async (email: string, password: string) => {
    const result = await authService.login(email, password);
    if (result.success && result.account) {
      setUser(result.account);
      return { data: { user: result.account }, error: null };
    }
    return { data: null, error: new Error(result.error) };
  };

  const signOut = async () => {
    await authService.logout();
    setUser(null);
    return { error: null };
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };
};