
import React from 'react';
import { useRole, UserRole } from '@/hooks/useRole';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredRole?: UserRole;
  fallback?: React.ReactNode;
}

const RoleGuard = ({ 
  children, 
  allowedRoles, 
  requiredRole, 
  fallback = null 
}: RoleGuardProps) => {
  const { role, loading } = useRole();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-sm text-gray-500">Vérification des permissions...</div>
      </div>
    );
  }

  if (!role) {
    return fallback;
  }

  // Vérifier le rôle requis spécifique
  if (requiredRole && role !== requiredRole) {
    return fallback;
  }

  // Vérifier si le rôle est dans la liste des rôles autorisés
  if (allowedRoles && !allowedRoles.includes(role)) {
    return fallback;
  }

  return <>{children}</>;
};

export default RoleGuard;
