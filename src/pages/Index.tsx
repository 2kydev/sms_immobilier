
import React, { useState } from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import AuthPage from '../components/auth/AuthPage';
import Layout from '../components/Layout';
import Dashboard from '../components/Dashboard';
import ClientManager from '../components/ClientManager';
import PropertyManager from '../components/PropertyManager';
import VisitManager from '../components/VisitManager';
import Pipeline from '../components/Pipeline';
import UserManager from '../components/users/UserManager';

const Index = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'clients':
        return <ClientManager />;
      case 'properties':
        return <PropertyManager />;
      case 'visits':
        return <VisitManager />;
      case 'pipeline':
        return <Pipeline />;
      case 'users':
        return <UserManager />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeSection={activeSection} onSectionChange={setActiveSection}>
      {renderContent()}
    </Layout>
  );
};

export default Index;
