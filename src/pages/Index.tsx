
import React, { useState } from 'react';
import Dashboard from '../components/Dashboard';
import ClientManager from '../components/ClientManager';
import PropertyManager from '../components/PropertyManager';
import VisitManager from '../components/VisitManager';
import Pipeline from '../components/Pipeline';
import UserManager from '../components/UserManager';
import AgentManager from '../components/AgentManager';
import RoleGuard from '../components/RoleGuard';
import { useRole } from '../hooks/useRole';
import { useSearchParams } from 'react-router-dom';

const Index = () => {
  const [searchParams] = useSearchParams();
  const activeSection = searchParams.get('tab') || 'dashboard';
  const { canAccessDashboard, canAccessPipeline, canManageUsers } = useRole();

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <RoleGuard 
            allowedRoles={['admin', 'dg']}
            fallback={
              <div className="p-6 text-center">
                <p className="text-gray-500">Vous n'avez pas accès au tableau de bord.</p>
              </div>
            }
          >
            <Dashboard />
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
            allowedRoles={['admin', 'dg']}
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
        return <UserManager />;
      default:
        return canAccessDashboard() ? <Dashboard /> : <ClientManager />;
    }
  };

  return renderContent();
};

export default Index;
