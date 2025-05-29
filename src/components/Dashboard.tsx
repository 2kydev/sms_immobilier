import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Calendar, TrendingUp, Home, Users, Eye, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import DashboardStats from './dashboard/DashboardStats';
import UserProfile from './dashboard/UserProfile';
import UserPreferences from './dashboard/UserPreferences';

interface DashboardData {
  totalProperties: number;
  totalClients: number;
  weeklyVisits: number;
  monthlyRevenue: number;
  lastMonthRevenue: number;
  propertyTypes: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  clientTypes: Array<{
    type: string;
    count: number;
  }>;
  monthlyData: Array<{
    month: string;
    transactions: number;
    revenue: number;
  }>;
  upcomingVisits: Array<{
    id: string;
    client: string;
    property: string;
    time: string;
    agent: string;
    date: string;
  }>;
  recentActivities: Array<{
    id: string;
    action: string;
    description: string;
    time: string;
    type: string;
  }>;
}

const Dashboard = () => {
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
      // Récupérer le nombre total de propriétés
      const {
        count: propertiesCount
      } = await supabase.from('properties').select('*', {
        count: 'exact',
        head: true
      });

      // Récupérer le nombre total de clients
      const {
        count: clientsCount
      } = await supabase.from('clients').select('*', {
        count: 'exact',
        head: true
      });

      // Récupérer les visites de cette semaine
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      const {
        count: weeklyVisitsCount
      } = await supabase.from('visits').select('*', {
        count: 'exact',
        head: true
      }).gte('date', startOfWeek.toISOString().split('T')[0]).lte('date', endOfWeek.toISOString().split('T')[0]).eq('statut', 'planifiee');

      // Récupérer les données des transactions pour le CA mensuel en FCFA
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

      // CA du mois en cours - transactions finalisées (conclues)
      const { data: currentMonthTransactions } = await supabase
        .from('transactions')
        .select('valeur')
        .eq('etape', 'conclue')
        .gte('date_creation', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`);

      // CA du mois précédent pour comparaison
      const { data: lastMonthTransactions } = await supabase
        .from('transactions')
        .select('valeur')
        .eq('etape', 'conclue')
        .gte('date_creation', `${lastMonthYear}-${lastMonth.toString().padStart(2, '0')}-01`)
        .lt('date_creation', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`);

      const monthlyRevenue = currentMonthTransactions?.reduce((sum, t) => sum + t.valeur, 0) || 0;
      const lastMonthRevenue = lastMonthTransactions?.reduce((sum, t) => sum + t.valeur, 0) || 0;

      // Récupérer les types de propriétés
      const {
        data: properties
      } = await supabase.from('properties').select('type');
      const propertyTypeCounts = properties?.reduce((acc: any, prop) => {
        acc[prop.type] = (acc[prop.type] || 0) + 1;
        return acc;
      }, {}) || {};
      const propertyTypes = Object.entries(propertyTypeCounts).map(([type, count], index) => ({
        name: type,
        value: count as number,
        color: ['#1e40af', '#b59f3b', '#6b7280', '#dc2626', '#059669'][index % 5]
      }));

      // Récupérer les types de clients
      const {
        data: clients
      } = await supabase.from('clients').select('type');
      const clientTypeCounts = clients?.reduce((acc: any, client) => {
        acc[client.type] = (acc[client.type] || 0) + 1;
        return acc;
      }, {}) || {};
      const clientTypes = Object.entries(clientTypeCounts).map(([type, count]) => ({
        type,
        count: count as number
      }));

      // Récupérer les données mensuelles des 6 derniers mois
      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const {
          data: monthTransactions
        } = await supabase.from('transactions').select('valeur').eq('etape', 'fermee').gte('date_creation', `${year}-${month.toString().padStart(2, '0')}-01`).lt('date_creation', `${year}-${(month + 1).toString().padStart(2, '0')}-01`);
        const revenue = monthTransactions?.reduce((sum, t) => sum + t.valeur, 0) || 0;
        const transactions = monthTransactions?.length || 0;
        monthlyData.push({
          month: date.toLocaleDateString('fr-FR', {
            month: 'short'
          }),
          transactions,
          revenue
        });
      }

      // Récupérer les visites à venir aujourd'hui
      const today = new Date().toISOString().split('T')[0];
      const {
        data: todayVisits
      } = await supabase.from('visits').select('*').eq('date', today).eq('statut', 'planifiee').order('heure', {
        ascending: true
      }).limit(5);
      const upcomingVisits = todayVisits?.map(visit => ({
        id: visit.id,
        client: `${visit.client_prenom} ${visit.client_nom}`,
        property: visit.propriete_titre,
        time: visit.heure,
        agent: visit.agent,
        date: visit.date
      })) || [];

      // Récupérer les activités récentes dynamiques depuis la base de données
      const recentActivities = await fetchRecentActivities();

      setDashboardData({
        totalProperties: propertiesCount || 0,
        totalClients: clientsCount || 0,
        weeklyVisits: weeklyVisitsCount || 0,
        monthlyRevenue,
        lastMonthRevenue,
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

  const fetchRecentActivities = async () => {
    const activities = [];

    try {
      // Dernières transactions créées
      const { data: recentTransactions } = await supabase
        .from('transactions')
        .select('*, clients(nom, prenom), properties(titre)')
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentTransactions) {
        recentTransactions.forEach(transaction => {
          const timeAgo = getTimeAgo(transaction.created_at);
          activities.push({
            id: `transaction-${transaction.id}`,
            action: 'Nouvelle transaction créée',
            description: `${transaction.clients?.prenom} ${transaction.clients?.nom} - ${transaction.properties?.titre}`,
            time: timeAgo,
            type: 'transaction'
          });
        });
      }

      // Dernières propriétés ajoutées
      const { data: recentProperties } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      if (recentProperties) {
        recentProperties.forEach(property => {
          const timeAgo = getTimeAgo(property.created_at);
          activities.push({
            id: `property-${property.id}`,
            action: 'Nouvelle propriété ajoutée',
            description: property.titre,
            time: timeAgo,
            type: 'property'
          });
        });
      }

      // Dernières ventes finalisées
      const { data: closedDeals } = await supabase
        .from('transactions')
        .select('*, clients(nom, prenom), properties(titre)')
        .eq('etape', 'conclue')
        .order('updated_at', { ascending: false })
        .limit(2);

      if (closedDeals) {
        closedDeals.forEach(deal => {
          const timeAgo = getTimeAgo(deal.updated_at);
          activities.push({
            id: `deal-${deal.id}`,
            action: 'Vente finalisée',
            description: `${deal.clients?.prenom} ${deal.clients?.nom} - ${deal.properties?.titre}`,
            time: timeAgo,
            type: 'deal'
          });
        });
      }

      // Trier par date de création et prendre les 10 plus récentes
      return activities
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 10);

    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return [];
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays}j`;
    } else if (diffHours > 0) {
      return `${diffHours}h`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}min`;
    } else {
      return 'maintenant';
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

  const getRevenueChange = () => {
    if (dashboardData.lastMonthRevenue === 0) return { percentage: 0, isPositive: true };
    const change = (dashboardData.monthlyRevenue - dashboardData.lastMonthRevenue) / dashboardData.lastMonthRevenue * 100;
    return {
      percentage: Math.abs(change),
      isPositive: change >= 0
    };
  };

  const formatCurrencyFCFA = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M FCFA`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}k FCFA`;
    }
    return `${amount.toLocaleString('fr-FR')} FCFA`;
  };

  const revenueChange = getRevenueChange();

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

      {/* KPIs Principaux - Vue d'ensemble moderne */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Biens</p>
                <p className="text-3xl font-bold">{dashboardData.totalProperties}</p>
              </div>
              <Home className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Clients</p>
                <p className="text-3xl font-bold">{dashboardData.totalClients}</p>
              </div>
              <Users className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Visites Cette Semaine</p>
                <p className="text-3xl font-bold">{dashboardData.weeklyVisits}</p>
              </div>
              <Eye className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">CA Mensuel</p>
                <p className="text-xl font-bold">
                  {formatCurrencyFCFA(dashboardData.monthlyRevenue)}
                </p>
                <div className="flex items-center gap-1 text-xs">
                  <TrendingUp className={`h-3 w-3 ${revenueChange.isPositive ? 'text-green-200' : 'text-red-200'}`} />
                  <span className={revenueChange.isPositive ? 'text-green-200' : 'text-red-200'}>
                    {revenueChange.isPositive ? '+' : '-'}{revenueChange.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques et données */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition des propriétés */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition des Propriétés</CardTitle>
            <CardDescription>Distribution par type de bien</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={dashboardData.propertyTypes} cx="50%" cy="50%" labelLine={false} label={({
                name,
                percent
              }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {dashboardData.propertyTypes.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Évolution mensuelle */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution du Chiffre d'Affaires</CardTitle>
            <CardDescription>Transactions et revenus sur 6 mois</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip formatter={(value, name) => [name === 'revenue' ? `${((value as number) / 1000000).toFixed(1)}M€` : value, name === 'revenue' ? 'Chiffre d\'affaires' : 'Transactions']} />
                <Bar yAxisId="left" dataKey="transactions" fill="#1e40af" />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#b59f3b" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Segmentation clients */}
        <Card>
          <CardHeader>
            <CardTitle>Segmentation des Clients</CardTitle>
            <CardDescription>Répartition par type de client</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dashboardData.clientTypes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#1e40af" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Calendrier des visites aujourd'hui */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Visites Aujourd'hui
            </CardTitle>
            <CardDescription>Planning des visites</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-80 overflow-y-auto">
            {dashboardData.upcomingVisits.length > 0 ? dashboardData.upcomingVisits.map(visit => <div key={visit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-medium text-sm">{visit.client}</p>
                    <p className="text-xs text-gray-600 truncate">{visit.property}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary">{visit.time}</p>
                    <p className="text-xs text-gray-500">{visit.agent}</p>
                  </div>
                </div>) : <p className="text-center text-gray-500 py-4">Aucune visite programmée aujourd'hui</p>}
          </CardContent>
        </Card>

        {/* Activité récente dynamique */}
        <Card>
          <CardHeader>
            <CardTitle>Activité Récente</CardTitle>
            <CardDescription>Dernières actions dans le CRM</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-80 overflow-y-auto">
            {dashboardData.recentActivities.length > 0 ? (
              dashboardData.recentActivities.map(activity => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'transaction' ? 'bg-blue-500' : 
                    activity.type === 'deal' ? 'bg-green-500' : 
                    activity.type === 'property' ? 'bg-yellow-500' : 'bg-purple-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-400">Il y a {activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">Aucune activité récente</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
