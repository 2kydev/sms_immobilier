
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

      {/* Nouvelle disposition : 3 sections égales (1/3 chacune) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Segmentation clients - 1/3 de l'espace */}
        <div className="lg:col-span-1">
          <div className="card bg-card text-card-foreground shadow-sm rounded-lg border h-full">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-xl font-semibold leading-none tracking-tight">Segmentation des Clients</h3>
              <p className="text-sm text-muted-foreground">Répartition par type</p>
            </div>
            <div className="p-6 pt-0">
              <div style={{ width: '100%', height: '300px' }}>
                <div className="recharts-responsive-container" style={{ width: '100%', height: '100%' }}>
                  <div className="recharts-wrapper" style={{ position: 'relative', cursor: 'default', width: '100%', height: '300px' }}>
                    <svg className="recharts-surface" width="100%" height="300" viewBox="0 0 400 300">
                      <g className="recharts-cartesian-grid">
                        {Array.from({ length: dashboardData.clientTypes.length + 1 }, (_, i) => (
                          <line key={i} strokeDasharray="3 3" stroke="#e0e7ff" x1={50 + i * (300 / dashboardData.clientTypes.length)} y1={20} x2={50 + i * (300 / dashboardData.clientTypes.length)} y2={280} />
                        ))}
                        {Array.from({ length: 6 }, (_, i) => (
                          <line key={i} strokeDasharray="3 3" stroke="#e0e7ff" x1={50} y1={20 + i * 43.33} x2={350} y2={20 + i * 43.33} />
                        ))}
                      </g>
                      <g className="recharts-xAxis">
                        {dashboardData.clientTypes.map((item, index) => {
                          const totalClients = dashboardData.clientTypes.reduce((sum, c) => sum + c.count, 0);
                          const percentage = totalClients > 0 ? ((item.count / totalClients) * 100).toFixed(1) : 0;
                          const xPos = 50 + (index + 0.5) * (300 / dashboardData.clientTypes.length);
                          return (
                            <text key={index} x={xPos} y={295} textAnchor="middle" fill="#666" fontSize="10">
                              {item.type}
                            </text>
                          );
                        })}
                      </g>
                      <g className="recharts-bar">
                        {dashboardData.clientTypes.map((item, index) => {
                          const totalClients = dashboardData.clientTypes.reduce((sum, c) => sum + c.count, 0);
                          const percentage = totalClients > 0 ? ((item.count / totalClients) * 100).toFixed(1) : 0;
                          const barHeight = totalClients > 0 ? (item.count / Math.max(...dashboardData.clientTypes.map(c => c.count))) * 240 : 0;
                          const barWidth = 300 / dashboardData.clientTypes.length * 0.6;
                          const xPos = 50 + index * (300 / dashboardData.clientTypes.length) + (300 / dashboardData.clientTypes.length - barWidth) / 2;
                          
                          return (
                            <g key={index}>
                              <rect
                                x={xPos}
                                y={280 - barHeight}
                                width={barWidth}
                                height={barHeight}
                                fill="#1e40af"
                              />
                              <text
                                x={xPos + barWidth / 2}
                                y={280 - barHeight / 2}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="#fff"
                                fontSize="12"
                                fontWeight="bold"
                              >
                                {percentage}%
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

        {/* Visites aujourd'hui - 1/3 de l'espace */}
        <div className="lg:col-span-1">
          <UpcomingVisits upcomingVisits={dashboardData.upcomingVisits} />
        </div>

        {/* Activités récentes - 1/3 de l'espace */}
        <div className="lg:col-span-1">
          <RecentActivities recentActivities={dashboardData.recentActivities} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
