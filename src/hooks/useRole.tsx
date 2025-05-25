
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type UserRole = 'admin' | 'directeur' | 'agent' | 'commercial';

export const useRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setRole(data?.role || 'commercial');
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole('commercial');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const hasRole = (requiredRole: UserRole): boolean => {
    return role === requiredRole;
  };

  const hasAnyRole = (requiredRoles: UserRole[]): boolean => {
    return role ? requiredRoles.includes(role) : false;
  };

  const canAccessDashboard = (): boolean => {
    return hasAnyRole(['admin', 'directeur']);
  };

  const canAccessPipeline = (): boolean => {
    return hasAnyRole(['admin', 'directeur', 'commercial']);
  };

  const canManageUsers = (): boolean => {
    return hasRole('admin');
  };

  return {
    role,
    loading,
    hasRole,
    hasAnyRole,
    canAccessDashboard,
    canAccessPipeline,
    canManageUsers,
  };
};
