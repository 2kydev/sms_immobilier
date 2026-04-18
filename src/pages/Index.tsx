
import React, { useState } from 'react';
import Dashboard from '../components/Dashboard';
import DGDashboard from '../components/DGDashboard';
import ClientManager from '../components/ClientManager';
import PropertyManager from '../components/PropertyManager';
import VisitManager from '../components/VisitManager';
import UserManager from '../components/UserManager';
import AgentManager from '../components/AgentManager';
import AuditLogViewer from '../components/AuditLogViewer';
import RoleGuard from '../components/RoleGuard';
import { useRole } from '../hooks/useRole';
import { useSearchParams } from 'react-router-dom';

const Index = () => {
  const [searchParams] = useSearchParams();
  const { canAccessDashboard, canManageUsers, role } = useRole();
  const activeSection = searchParams.get('tab') || (canAccessDashboard() ? 'dashboard' : 'clients');

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <RoleGuard
            allowedRoles={['admin', 'dg']}
            fallback={<ClientManager />}
          >
            <DGDashboard />
          </RoleGuard>
        );
      case 'clients':
        return <ClientManager />;
      case 'properties':
        return <PropertyManager />;
      case 'visits':
        return <VisitManager />;
      case 'agents':
        return (
          <RoleGuard 
            requiredRole="admin"
            fallback={
              <div className="p-6 text-center">
                <p className="text-gray-500">Vous n'avez pas accès à la gestion des agents.</p>
              </div>
            }
          >
            <AgentManager />
          </RoleGuard>
        );
      case 'users':
        return (
          <RoleGuard
            requiredRole="admin"
            fallback={
              <div className="p-6 text-center">
                <p className="text-gray-500">Vous n'avez pas accès à la gestion des utilisateurs.</p>
              </div>
            }
          >
            <UserManager />
          </RoleGuard>
        );
      case 'audit':
        return (
          <RoleGuard
            allowedRoles={['admin', 'dg']}
            fallback={
              <div className="p-6 text-center">
                <p className="text-gray-500">Accès réservé aux administrateurs.</p>
              </div>
            }
          >
            <AuditLogViewer />
          </RoleGuard>
        );
      default:
        return canAccessDashboard() ? <DGDashboard /> : <ClientManager />;
    }
  };

  return renderContent();
};

export default Index;
