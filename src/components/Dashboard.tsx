
import React from 'react';
import { useEnhancedDashboard } from '@/hooks/useEnhancedDashboard';
import ProfessionalKPIs from './dashboard/ProfessionalKPIs';
import DashboardChartsPro from './dashboard/DashboardChartsPro';
import DashboardAlerts from './dashboard/DashboardAlerts';
import UpcomingVisits from './dashboard/UpcomingVisits';
import RecentActivities from './dashboard/RecentActivities';
import PropertyManagementKPIs from '@/components/PropertyManagementKPIs';
import SalePropertiesKPIs from '@/components/SalePropertiesKPIs';

const Dashboard = () => {
  const { dashboardData, loading, lastUpdated } = useEnhancedDashboard();

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="text-muted-foreground">Chargement du tableau de bord...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header avec informations de mise à jour */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-primary mb-2">Tableau de Bord</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble de votre activité immobilière
          </p>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-sm text-muted-foreground">
            Dernière mise à jour
          </div>
          <div className="text-sm font-medium text-primary">
            {lastUpdated.toLocaleDateString('fr-FR', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      </div>

      {/* KPIs Gestion de Biens */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-primary mb-4">Gestion des Biens</h2>
          <PropertyManagementKPIs 
            totalProperties={dashboardData.propertyKPIs.totalProperties}
            availableProperties={dashboardData.propertyKPIs.availableProperties}
            availableMaisons={dashboardData.propertyKPIs.availableMaisons || 0}
            availableTerrains={dashboardData.propertyKPIs.availableTerrains || 0}
            availableEntrepots={dashboardData.propertyKPIs.availableEntrepots || 0}
            valueByType={dashboardData.propertyKPIs.valueByType || { maison: 0, terrain: 0, entrepot: 0, autres: 0 }}
          />
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold text-primary mb-4">Biens à Vendre par Type</h2>
          <SalePropertiesKPIs 
            valueByType={dashboardData.propertyKPIs.saleValueByType || { terrain: 0, maison: 0, entrepot: 0, immeuble: 0, autres: 0 }}
            countByType={dashboardData.propertyKPIs.saleCountByType || { terrain: 0, maison: 0, entrepot: 0, immeuble: 0, autres: 0 }}
          />
        </div>
      </div>

      {/* KPIs Professionnels */}
      <ProfessionalKPIs
        propertyKPIs={dashboardData.propertyKPIs}
        salesKPIs={dashboardData.salesKPIs}
        clientKPIs={dashboardData.clientKPIs}
        visitKPIs={dashboardData.visitKPIs}
      />

      {/* Graphiques et Analyses */}
      <DashboardChartsPro
        transactionPipeline={dashboardData.transactionPipeline}
        monthlyData={dashboardData.monthlyData}
        clientsByType={dashboardData.clientKPIs.clientsByType}
      />

      {/* Section Alertes et Activités */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Alertes - 1/3 de l'espace */}
        <div className="xl:col-span-1">
          <DashboardAlerts alerts={dashboardData.alerts} />
        </div>

        {/* Visites et Activités - 2/3 de l'espace */}
        <div className="xl:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UpcomingVisits upcomingVisits={[]} />
          <RecentActivities recentActivities={[]} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
