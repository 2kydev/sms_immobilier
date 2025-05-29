
import React from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import DashboardKPIs from './dashboard/DashboardKPIs';
import DashboardCharts from './dashboard/DashboardCharts';
import UpcomingVisits from './dashboard/UpcomingVisits';
import RecentActivities from './dashboard/RecentActivities';

const Dashboard = () => {
  const { dashboardData, loading } = useDashboardData();

  if (loading) {
    return <div className="p-6">Chargement du tableau de bord...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Tableau de Bord</h1>
        <div className="text-sm text-gray-500">
          Dernière mise à jour: {new Date().toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>

      {/* KPIs Principaux */}
      <DashboardKPIs
        totalProperties={dashboardData.totalProperties}
        totalClients={dashboardData.totalClients}
        weeklyVisits={dashboardData.weeklyVisits}
        monthlyRevenue={dashboardData.monthlyRevenue}
        lastMonthRevenue={dashboardData.lastMonthRevenue}
      />

      {/* Graphiques */}
      <DashboardCharts
        propertyTypes={dashboardData.propertyTypes}
        monthlyData={dashboardData.monthlyData}
        clientTypes={dashboardData.clientTypes}
      />

      {/* Section inférieure avec visites et activités */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingVisits upcomingVisits={dashboardData.upcomingVisits} />
        <RecentActivities recentActivities={dashboardData.recentActivities} />
      </div>
    </div>
  );
};

export default Dashboard;
