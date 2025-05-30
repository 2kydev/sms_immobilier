
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

  const fetchRecentActivities = async () => {
    const activities = [];

    try {
      // Dernières transactions créées (limite 2)
      const { data: recentTransactions } = await supabase
        .from('transactions')
        .select('*, clients(nom, prenom), properties(titre)')
        .order('created_at', { ascending: false })
        .limit(2);

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

      // Dernières propriétés ajoutées (limite 2)
      const { data: recentProperties } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(2);

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

      // Dernières ventes finalisées (limite 1)
      const { data: closedDeals } = await supabase
        .from('transactions')
        .select('*, clients(nom, prenom), properties(titre)')
        .eq('etape', 'conclue')
        .order('updated_at', { ascending: false })
        .limit(1);

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

      // Trier par date de création et prendre les 5 plus récentes
      return activities
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 5);

    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return [];
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Récupérer le nombre total de propriétés
      const { count: propertiesCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });

      // Récupérer le nombre total de clients
      const { count: clientsCount } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });

      // Récupérer les visites de cette semaine
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      
      const { count: weeklyVisitsCount } = await supabase
        .from('visits')
        .select('*', { count: 'exact', head: true })
        .gte('date', startOfWeek.toISOString().split('T')[0])
        .lte('date', endOfWeek.toISOString().split('T')[0])
        .eq('statut', 'planifiee');

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
      const { data: properties } = await supabase.from('properties').select('type');
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
      const { data: clients } = await supabase.from('clients').select('type');
      const clientTypeCounts = clients?.reduce((acc: any, client) => {
        acc[client.type] = (acc[client.type] || 0) + 1;
        return acc;
      }, {}) || {};
      
      const clientTypes = Object.entries(clientTypeCounts).map(([type, count]) => ({
        type,
        count: count as number
      }));

      // Récupérer les données mensuelles des 6 derniers mois pour les transactions conclues
      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        
        const { data: monthTransactions } = await supabase
          .from('transactions')
          .select('valeur')
          .eq('etape', 'conclue')
          .gte('date_creation', `${year}-${month.toString().padStart(2, '0')}-01`)
          .lt('date_creation', `${year}-${(month + 1).toString().padStart(2, '0')}-01`);
        
        const revenue = monthTransactions?.reduce((sum, t) => sum + t.valeur, 0) || 0;
        const transactions = monthTransactions?.length || 0;
        
        monthlyData.push({
          month: date.toLocaleDateString('fr-FR', { month: 'short' }),
          transactions,
          revenue
        });
      }

      // Récupérer les 5 prochaines visites d'aujourd'hui
      const today = new Date().toISOString().split('T')[0];
      const { data: todayVisits } = await supabase
        .from('visits')
        .select('*')
        .eq('date', today)
        .eq('statut', 'planifiee')
        .order('heure', { ascending: true })
        .limit(5);
      
      const upcomingVisits = todayVisits?.map(visit => ({
        id: visit.id,
        client: `${visit.client_prenom} ${visit.client_nom}`,
        property: visit.propriete_titre,
        time: visit.heure,
        agent: visit.agent,
        date: visit.date
      })) || [];

      // Récupérer les 5 activités récentes dynamiques depuis la base de données
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
