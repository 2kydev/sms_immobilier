
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface Stats {
  activeProperties: number;
  totalClients: number;
  weeklyVisits: number;
  monthlyRevenue: number;
}

const DashboardStats = () => {
  const [stats, setStats] = useState<Stats>({
    activeProperties: 0,
    totalClients: 0,
    weeklyVisits: 0,
    monthlyRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      // Fetch properties count
      const { count: propertiesCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });

      // Fetch clients count
      const { count: clientsCount } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });

      // Fetch this week's visits
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const { count: visitsCount } = await supabase
        .from('visits')
        .select('*', { count: 'exact', head: true })
        .gte('date', oneWeekAgo.toISOString().split('T')[0]);

      // Fetch this month's revenue from transactions
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const { data: transactions } = await supabase
        .from('transactions')
        .select('valeur')
        .gte('date_creation', firstDayOfMonth.toISOString().split('T')[0])
        .eq('etape', 'conclue');

      const monthlyRevenue = transactions?.reduce((sum, t) => sum + (t.valeur || 0), 0) || 0;

      setStats({
        activeProperties: propertiesCount || 0,
        totalClients: clientsCount || 0,
        weeklyVisits: visitsCount || 0,
        monthlyRevenue
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Set up real-time subscriptions for stats updates
    const propertiesChannel = supabase
      .channel('properties-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, fetchStats)
      .subscribe();

    const clientsChannel = supabase
      .channel('clients-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, fetchStats)
      .subscribe();

    const visitsChannel = supabase
      .channel('visits-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'visits' }, fetchStats)
      .subscribe();

    const transactionsChannel = supabase
      .channel('transactions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, fetchStats)
      .subscribe();

    return () => {
      supabase.removeChannel(propertiesChannel);
      supabase.removeChannel(clientsChannel);
      supabase.removeChannel(visitsChannel);
      supabase.removeChannel(transactionsChannel);
    };
  }, []);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M€`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}k€`;
    }
    return `${amount}€`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-l-4 border-l-gray-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Chargement...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-400">--</div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="card-hover border-l-4 border-l-blue-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Propriétés Actives</CardTitle>
          <div className="h-4 w-4 text-blue-600">🏠</div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats.activeProperties}</div>
          <p className="text-xs text-gray-500">Total dans la base</p>
        </CardContent>
      </Card>

      <Card className="card-hover border-l-4 border-l-green-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Visites Cette Semaine</CardTitle>
          <div className="h-4 w-4 text-green-600">📅</div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.weeklyVisits}</div>
          <p className="text-xs text-gray-500">7 derniers jours</p>
        </CardContent>
      </Card>

      <Card className="card-hover border-l-4 border-l-yellow-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">CA du Mois</CardTitle>
          <div className="h-4 w-4 text-yellow-600">💰</div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.monthlyRevenue)}</div>
          <p className="text-xs text-gray-500">Transactions conclues</p>
        </CardContent>
      </Card>

      <Card className="card-hover border-l-4 border-l-purple-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total Clients</CardTitle>
          <div className="h-4 w-4 text-purple-600">👥</div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{stats.totalClients}</div>
          <p className="text-xs text-gray-500">Base de données</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
