
import React from 'react';
import { useAuth } from './AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  allowedRoles 
}) => {
  const { profile, loading } = useAuth();

  if (loading) {
    return <div className="p-6">Chargement...</div>;
  }

  if (!profile || !profile.is_active) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold text-red-600">Accès non autorisé</h2>
        <p className="text-gray-600">Vous n'avez pas les permissions nécessaires.</p>
      </div>
    );
  }

  if (requiredRole && profile.role !== requiredRole) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold text-red-600">Accès non autorisé</h2>
        <p className="text-gray-600">Rôle requis: {requiredRole}</p>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold text-red-600">Accès non autorisé</h2>
        <p className="text-gray-600">Vous n'avez pas les permissions nécessaires.</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
