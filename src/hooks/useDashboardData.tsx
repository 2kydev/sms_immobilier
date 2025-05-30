
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DashboardData } from '@/types/dashboard';
import { fetchBasicStats, fetchRevenueData } from '@/services/dashboardStatsService';
import { fetchPropertyTypes, fetchClientTypes, fetchMonthlyData } from '@/services/dashboardChartsService';
import { fetchRecentActivities, fetchUpcomingVisits } from '@/services/dashboardActivitiesService';

export const useDashboardData = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalProperties: 0,
    totalClients: 0,
    weeklyVisits: 0,
    monthlyRevenue: 0,
    lastMonthRevenue: 0,
    propertyTypes: [],
    clientTypes: [],
    monthlyData: [],
    upcomingVisits: [],
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      // Fetch all data in parallel for better performance
      const [
        basicStats,
        revenueData,
        propertyTypes,
        clientTypes,
        monthlyData,
        upcomingVisits,
        recentActivities
      ] = await Promise.all([
        fetchBasicStats(),
        fetchRevenueData(),
        fetchPropertyTypes(),
        fetchClientTypes(),
        fetchMonthlyData(),
        fetchUpcomingVisits(),
        fetchRecentActivities()
      ]);

      setDashboardData({
        ...basicStats,
        ...revenueData,
        propertyTypes,
        clientTypes,
        monthlyData,
        upcomingVisits,
        recentActivities
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Configurer la mise à jour en temps réel
    const channel = supabase
      .channel('dashboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, fetchDashboardData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, fetchDashboardData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'visits' }, fetchDashboardData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, fetchDashboardData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { dashboardData, loading, refetch: fetchDashboardData };
};
