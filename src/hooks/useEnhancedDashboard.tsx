import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedDashboardData } from '@/types/enhancedDashboard';
import { fetchEnhancedDashboardData } from '@/services/enhancedDashboardService';

export const useEnhancedDashboard = () => {
  const [dashboardData, setDashboardData] = useState<EnhancedDashboardData>({
    propertyKPIs: {
      totalProperties: 0,
      availableProperties: 0,
      soldThisMonth: 0,
      underNegotiation: 0,
      averagePrice: 0,
      totalValue: 0,
      salesTrend: { percentage: 0, isPositive: true }
    },
    salesKPIs: {
      monthlyRevenue: 0,
      lastMonthRevenue: 0,
      totalDeals: 0,
      averageDealValue: 0,
      conversionRate: 0,
      revenueTrend: { percentage: 0, isPositive: true }
    },
    clientKPIs: {
      totalClients: 0,
      newClientsThisMonth: 0,
      activeClients: 0,
      clientsByType: [],
      clientTrend: { percentage: 0, isPositive: true }
    },
    visitKPIs: {
      totalVisitsThisMonth: 0,
      scheduledToday: 0,
      completedVisits: 0,
      visitToSaleConversion: 0,
      averageVisitsPerProperty: 0,
      visitTrend: { percentage: 0, isPositive: true }
    },
    transactionPipeline: {
      prospection: 0,
      qualification: 0,
      negotiation: 0,
      signature: 0,
      finalise: 0,
      totalValue: 0
    },
    alerts: [],
    monthlyData: [],
    agentPerformance: [],
    topVisitedProperties: [],
  });
  
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching enhanced dashboard data...');
      const data = await fetchEnhancedDashboardData();
      console.log('Enhanced dashboard data fetched:', data);
      setDashboardData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching enhanced dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('enhanced-dashboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'visits' }, fetchData)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return { 
    dashboardData, 
    loading, 
    lastUpdated,
    refetch: fetchData 
  };
};