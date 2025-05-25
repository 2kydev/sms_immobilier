
import React, { useState } from 'react';
import Layout from '../components/Layout';
import Dashboard from '../components/Dashboard';
import ClientManager from '../components/ClientManager';
import PropertyManager from '../components/PropertyManager';
import VisitManager from '../components/VisitManager';
import Pipeline from '../components/Pipeline';

const Index = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

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
