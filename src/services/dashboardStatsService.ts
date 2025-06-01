
import { supabase } from '@/integrations/supabase/client';
import { getWeekRange, getCurrentAndLastMonth, getMonthDateRange } from '@/utils/timeUtils';

export const fetchBasicStats = async () => {
  // Récupérer le nombre total de propriétés
  const { count: propertiesCount } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true });

  // Récupérer le nombre total de clients
  const { count: clientsCount } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true });

  // Récupérer les visites de cette semaine
  const { startOfWeek, endOfWeek } = getWeekRange();
  
  const { count: weeklyVisitsCount } = await supabase
    .from('visits')
    .select('*', { count: 'exact', head: true })
    .gte('date', startOfWeek.toISOString().split('T')[0])
    .lte('date', endOfWeek.toISOString().split('T')[0])
    .eq('statut', 'planifiee');

  return {
    totalProperties: propertiesCount || 0,
    totalClients: clientsCount || 0,
    weeklyVisits: weeklyVisitsCount || 0
  };
};

export const fetchRevenueData = async () => {
  const { currentMonth, currentYear, lastMonth, lastMonthYear } = getCurrentAndLastMonth();

  console.log('Fetching ALL finalized transactions for total revenue');

  // CA TOTAL de toutes les transactions finalisées (conclues)
  const { data: allFinalizedTransactions } = await supabase
    .from('transactions')
    .select('valeur')
    .eq('etape', 'conclue');

  // CA du mois précédent pour comparaison - UNIQUEMENT transactions finalisées
  const { startDate: lastStartDate, endDate: lastEndDate } = getMonthDateRange(lastMonthYear, lastMonth);
  const { data: lastMonthTransactions } = await supabase
    .from('transactions')
    .select('valeur')
    .eq('etape', 'conclue')
    .gte('date_creation', lastStartDate)
    .lt('date_creation', lastEndDate);

  const monthlyRevenue = allFinalizedTransactions?.reduce((sum, t) => sum + t.valeur, 0) || 0;
  const lastMonthRevenue = lastMonthTransactions?.reduce((sum, t) => sum + t.valeur, 0) || 0;

  console.log('Total revenue from ALL finalized transactions:', monthlyRevenue);
  console.log('Last month revenue from finalized transactions:', lastMonthRevenue);

  return { monthlyRevenue, lastMonthRevenue };
};
