
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

  // Calculer le total des clients pour la segmentation
  const totalClients = dashboardData.clientTypes.reduce((sum, item) => sum + item.count, 0);
  const clientTypesWithPercentage = dashboardData.clientTypes.map(item => ({
    ...item,
    percentage: totalClients > 0 ? ((item.count / totalClients) * 100).toFixed(1) : 0
  }));

  const CustomLabel = (props: any) => {
    const { x, y, width, height, value, payload } = props;
    return (
      <text
        x={x + width / 2}
        y={y + height / 2}
        fill="#fff"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="12"
        fontWeight="bold"
      >
        {payload.percentage}%
      </text>
    );
  };

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

      {/* Nouvelle disposition : Segmentation clients (2/3) + Visites et Activités (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Segmentation clients - 8/12 (2/3) de l'espace */}
        <div className="lg:col-span-8">
          <div className="card bg-card text-card-foreground shadow-sm rounded-lg border">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-2xl font-semibold leading-none tracking-tight">Segmentation des Clients</h3>
              <p className="text-sm text-muted-foreground">Répartition par type de client</p>
            </div>
            <div className="p-6 pt-0">
              <div style={{ width: '100%', height: '350px' }}>
                <div className="recharts-responsive-container" style={{ width: '100%', height: '100%' }}>
                  <div className="recharts-wrapper" style={{ position: 'relative', cursor: 'default', width: '100%', height: '350px' }}>
                    <svg className="recharts-surface" width="100%" height="350" viewBox="0 0 800 350">
                      <g className="recharts-cartesian-grid">
                        {Array.from({ length: 6 }, (_, i) => (
                          <line key={i} strokeDasharray="3 3" stroke="#e0e7ff" x1={80 + i * 120} y1={20} x2={80 + i * 120} y2={330} />
                        ))}
                        {Array.from({ length: 8 }, (_, i) => (
                          <line key={i} strokeDasharray="3 3" stroke="#e0e7ff" x1={80} y1={20 + i * 38.75} x2={720} y2={20 + i * 38.75} />
                        ))}
                      </g>
                      <g className="recharts-xAxis">
                        {clientTypesWithPercentage.map((item, index) => (
                          <text key={index} x={140 + index * 160} y={345} textAnchor="middle" fill="#666" fontSize="12">
                            {item.type}
                          </text>
                        ))}
                      </g>
                      <g className="recharts-bar">
                        {clientTypesWithPercentage.map((item, index) => {
                          const barHeight = (item.count / Math.max(...clientTypesWithPercentage.map(c => c.count))) * 300;
                          return (
                            <g key={index}>
                              <rect
                                x={110 + index * 160}
                                y={330 - barHeight}
                                width={60}
                                height={barHeight}
                                fill="#1e40af"
                              />
                              <text
                                x={140 + index * 160}
                                y={330 - barHeight / 2}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="#fff"
                                fontSize="12"
                                fontWeight="bold"
                              >
                                {item.percentage}%
                              </text>
                            </g>
                          );
                        })}
                      </g>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modules Visites et Activités - 4/12 (1/3) de l'espace */}
        <div className="lg:col-span-4 space-y-6">
          <UpcomingVisits upcomingVisits={dashboardData.upcomingVisits} />
          <RecentActivities recentActivities={dashboardData.recentActivities} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
