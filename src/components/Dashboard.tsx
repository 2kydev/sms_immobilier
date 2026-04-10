import React from 'react';
import { useEnhancedDashboard } from '@/hooks/useEnhancedDashboard';
import SimplifiedKPIs from './dashboard/SimplifiedKPIs';
import PropertyTypeBreakdown from './dashboard/PropertyTypeBreakdown';
import SalesEvolutionChart from './dashboard/SalesEvolutionChart';
import AgentPerformanceTable from './dashboard/AgentPerformanceTable';
import TopVisitedProperties from './dashboard/TopVisitedProperties';
const Dashboard = () => {
  const {
    dashboardData,
    loading,
    lastUpdated
  } = useEnhancedDashboard();
  if (loading) {
    return <div className="p-6">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="text-muted-foreground">Chargement du tableau de bord...</span>
        </div>
      </div>;
  }
  return <div className="space-y-8 p-6">
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

      {/* KPIs Essentiels */}
      <SimplifiedKPIs 
        propertyKPIs={dashboardData.propertyKPIs}
        clientKPIs={dashboardData.clientKPIs}
        visitKPIs={dashboardData.visitKPIs}
        salesKPIs={dashboardData.salesKPIs}
      />

      {/* Répartition par Type */}
      <PropertyTypeBreakdown 
        availableMaisons={dashboardData.propertyKPIs.availableMaisons || 0}
        availableTerrains={dashboardData.propertyKPIs.availableTerrains || 0}
        availableEntrepots={dashboardData.propertyKPIs.availableEntrepots || 0}
        saleCountByType={dashboardData.propertyKPIs.saleCountByType || {
          terrain: 0,
          maison: 0,
          entrepot: 0,
          immeuble: 0,
          autres: 0
        }}
      />

      {/* Graphique Évolution Ventes */}
      <SalesEvolutionChart monthlyData={dashboardData.monthlyData} />

      {/* Performance agents + Top biens visités */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AgentPerformanceTable agents={dashboardData.agentPerformance} />
        <TopVisitedProperties properties={dashboardData.topVisitedProperties} />
      </div>
    </div>;
};
export default Dashboard;