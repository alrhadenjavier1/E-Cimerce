// src/components/admin/AdminRoute.tsx
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../../services/authService';

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const { account, isAdmin } = await authService.getCurrentUserWithRole();
      setIsAdmin(isAdmin);
      setLoading(false);
    };
    checkAdmin();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-theme-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return isAdmin ? <>{children}</> : <Navigate to="/" replace />;
};