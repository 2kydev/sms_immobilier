
import { supabase } from '@/integrations/supabase/client';
import { getMonthDateRange } from '@/utils/timeUtils';

export const fetchPropertyTypes = async () => {
  const { data: properties } = await supabase.from('properties').select('type');
  const propertyTypeCounts = properties?.reduce((acc: any, prop) => {
    acc[prop.type] = (acc[prop.type] || 0) + 1;
    return acc;
  }, {}) || {};
  
  return Object.entries(propertyTypeCounts).map(([type, count], index) => ({
    name: type,
    value: count as number,
    color: ['#1e40af', '#b59f3b', '#6b7280', '#dc2626', '#059669'][index % 5]
  }));
};

export const fetchClientTypes = async () => {
  const { data: clients } = await supabase.from('clients').select('type');
  const clientTypeCounts = clients?.reduce((acc: any, client) => {
    acc[client.type] = (acc[client.type] || 0) + 1;
    return acc;
  }, {}) || {};
  
  return Object.entries(clientTypeCounts).map(([type, count]) => ({
    type,
    count: count as number
  }));
};

export const fetchMonthlyData = async () => {
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    
    console.log(`Fetching finalized transactions for ${year}-${month}`);
    
    const { startDate, endDate } = getMonthDateRange(year, month);
    const { data: monthTransactions } = await supabase
      .from('transactions')
      .select('valeur')
      .eq('etape', 'conclue')
      .gte('date_creation', startDate)
      .lt('date_creation', endDate);
    
    const revenue = monthTransactions?.reduce((sum, t) => sum + t.valeur, 0) || 0;
    const transactions = monthTransactions?.length || 0;
    
    console.log(`Month ${date.toLocaleDateString('fr-FR', { month: 'short' })}: ${transactions} finalized transactions, ${revenue} FCFA revenue`);
    
    monthlyData.push({
      month: date.toLocaleDateString('fr-FR', { month: 'short' }),
      transactions,
      revenue
    });
  }
  
  return monthlyData;
};
