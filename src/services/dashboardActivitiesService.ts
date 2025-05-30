
import { supabase } from '@/integrations/supabase/client';
import { getTimeAgo } from '@/utils/timeUtils';

export const fetchRecentActivities = async () => {
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

export const fetchUpcomingVisits = async () => {
  const today = new Date().toISOString().split('T')[0];
  const { data: todayVisits } = await supabase
    .from('visits')
    .select('*')
    .eq('date', today)
    .eq('statut', 'planifiee')
    .order('heure', { ascending: true })
    .limit(5);
  
  return todayVisits?.map(visit => ({
    id: visit.id,
    client: `${visit.client_prenom} ${visit.client_nom}`,
    property: visit.propriete_titre,
    time: visit.heure,
    agent: visit.agent,
    date: visit.date
  })) || [];
};
