import { supabase } from '@/integrations/supabase/client';
import { PropertyKPIs, SalesKPIs, ClientKPIs, VisitKPIs, TransactionPipeline, DashboardAlerts, EnhancedDashboardData, AgentPerformance, TopVisitedProperty } from '@/types/enhancedDashboard';
import { getMonthDateRange, getCurrentAndLastMonth } from '@/utils/timeUtils';

export const fetchPropertyKPIs = async (): Promise<PropertyKPIs> => {
  const { data: properties } = await supabase
    .from('properties')
    .select('statut, prix, created_at, type, transaction_type');

  const { data: transactions } = await supabase
    .from('transactions')
    .select('etape, created_at')
    .eq('etape', 'finalise')
    .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

  const totalProperties = properties?.length || 0;
  const availableProperties = properties?.filter(p => p.statut === 'disponible').length || 0;
  const soldThisMonth = transactions?.length || 0;
  const underNegotiation = properties?.filter(p => p.statut === 'en_negociation').length || 0;
  const totalValue = properties?.reduce((sum, p) => sum + (p.prix || 0), 0) || 0;
  const averagePrice = totalProperties > 0 ? totalValue / totalProperties : 0;

  // Calculate available properties by type
  const availableProps = properties?.filter(p => p.statut === 'disponible') || [];
  const availableMaisons = availableProps.filter(p => p.type === 'maison').length;
  const availableTerrains = availableProps.filter(p => p.type === 'terrain').length;
  const availableEntrepots = availableProps.filter(p => p.type === 'entrepot').length;

  // Calculate value by type (all properties)
  const valueByType = {
    maison: properties?.filter(p => p.type === 'maison').reduce((sum, p) => sum + (p.prix || 0), 0) || 0,
    terrain: properties?.filter(p => p.type === 'terrain').reduce((sum, p) => sum + (p.prix || 0), 0) || 0,
    entrepot: properties?.filter(p => p.type === 'entrepot').reduce((sum, p) => sum + (p.prix || 0), 0) || 0,
    autres: properties?.filter(p => !['maison', 'terrain', 'entrepot'].includes(p.type)).reduce((sum, p) => sum + (p.prix || 0), 0) || 0
  };

  // Calculate sale properties by type (exclude archived)
  const saleProps = properties?.filter(p => p.transaction_type === 'vente' && p.statut !== 'archivé') || [];
  
  const saleValueByType = {
    terrain: saleProps.filter(p => p.type === 'terrain').reduce((sum, p) => sum + (p.prix || 0), 0),
    maison: saleProps.filter(p => p.type === 'maison').reduce((sum, p) => sum + (p.prix || 0), 0),
    entrepot: saleProps.filter(p => p.type === 'entrepot').reduce((sum, p) => sum + (p.prix || 0), 0),
    immeuble: saleProps.filter(p => p.type === 'immeuble').reduce((sum, p) => sum + (p.prix || 0), 0),
    autres: saleProps.filter(p => !['terrain', 'maison', 'entrepot', 'immeuble'].includes(p.type)).reduce((sum, p) => sum + (p.prix || 0), 0)
  };

  const saleCountByType = {
    terrain: saleProps.filter(p => p.type === 'terrain').length,
    maison: saleProps.filter(p => p.type === 'maison').length,
    entrepot: saleProps.filter(p => p.type === 'entrepot').length,
    immeuble: saleProps.filter(p => p.type === 'immeuble').length,
    autres: saleProps.filter(p => !['terrain', 'maison', 'entrepot', 'immeuble'].includes(p.type)).length
  };

  // Calculate sales trend (compare with last month)
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const { data: lastMonthTransactions } = await supabase
    .from('transactions')
    .select('etape')
    .eq('etape', 'finalise')
    .gte('created_at', new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1).toISOString())
    .lt('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

  const lastMonthSold = lastMonthTransactions?.length || 0;
  const salesTrend = {
    percentage: lastMonthSold > 0 ? Math.abs(((soldThisMonth - lastMonthSold) / lastMonthSold) * 100) : 0,
    isPositive: soldThisMonth >= lastMonthSold
  };

  return {
    totalProperties,
    availableProperties,
    soldThisMonth,
    underNegotiation,
    averagePrice,
    totalValue,
    salesTrend,
    availableMaisons,
    availableTerrains,
    availableEntrepots,
    valueByType,
    saleValueByType,
    saleCountByType
  };
};

export const fetchSalesKPIs = async (): Promise<SalesKPIs> => {
  const { currentMonth, currentYear, lastMonth, lastMonthYear } = getCurrentAndLastMonth();
  
  const { startDate: currentStartDate, endDate: currentEndDate } = getMonthDateRange(currentYear, currentMonth);
  const { startDate: lastStartDate, endDate: lastEndDate } = getMonthDateRange(lastMonthYear, lastMonth);

  const { data: currentMonthTransactions } = await supabase
    .from('transactions')
    .select('valeur, etape')
    .eq('etape', 'finalise')
    .gte('created_at', currentStartDate)
    .lt('created_at', currentEndDate);

  const { data: lastMonthTransactions } = await supabase
    .from('transactions')
    .select('valeur, etape')
    .eq('etape', 'finalise')
    .gte('created_at', lastStartDate)
    .lt('created_at', lastEndDate);

  const { data: allTransactions } = await supabase
    .from('transactions')
    .select('etape');

  const monthlyRevenue = currentMonthTransactions?.reduce((sum, t) => sum + (t.valeur || 0), 0) || 0;
  const lastMonthRevenue = lastMonthTransactions?.reduce((sum, t) => sum + (t.valeur || 0), 0) || 0;
  const totalDeals = currentMonthTransactions?.length || 0;
  const averageDealValue = totalDeals > 0 ? monthlyRevenue / totalDeals : 0;

  // Calculate conversion rate (finalized vs total transactions)
  const totalTransactions = allTransactions?.length || 0;
  const finalizedTransactions = allTransactions?.filter(t => t.etape === 'finalise').length || 0;
  const conversionRate = totalTransactions > 0 ? (finalizedTransactions / totalTransactions) * 100 : 0;

  const revenueTrend = {
    percentage: lastMonthRevenue > 0 ? Math.abs(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : 0,
    isPositive: monthlyRevenue >= lastMonthRevenue
  };

  return {
    monthlyRevenue,
    lastMonthRevenue,
    totalDeals,
    averageDealValue,
    conversionRate,
    revenueTrend
  };
};

export const fetchClientKPIs = async (): Promise<ClientKPIs> => {
  const { data: clients } = await supabase
    .from('clients')
    .select('type, created_at, dernier_contact');

  const totalClients = clients?.length || 0;
  
  // New clients this month
  const thisMonth = new Date();
  thisMonth.setDate(1);
  const newClientsThisMonth = clients?.filter(c => 
    new Date(c.created_at) >= thisMonth
  ).length || 0;

  // Active clients (contacted in last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const activeClients = clients?.filter(c => 
    new Date(c.dernier_contact) >= thirtyDaysAgo
  ).length || 0;

  // Clients by type with percentages
  const clientTypeCounts = clients?.reduce((acc: any, client) => {
    acc[client.type] = (acc[client.type] || 0) + 1;
    return acc;
  }, {}) || {};

  const clientsByType = Object.entries(clientTypeCounts).map(([type, count]) => ({
    type,
    count: count as number,
    percentage: totalClients > 0 ? ((count as number / totalClients) * 100) : 0
  }));

  // Calculate client trend (compare with last month)
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  lastMonth.setDate(1);
  const currentMonth = new Date();
  currentMonth.setDate(1);
  
  const lastMonthNewClients = clients?.filter(c => {
    const createdDate = new Date(c.created_at);
    return createdDate >= lastMonth && createdDate < currentMonth;
  }).length || 0;

  const clientTrend = {
    percentage: lastMonthNewClients > 0 ? Math.abs(((newClientsThisMonth - lastMonthNewClients) / lastMonthNewClients) * 100) : 0,
    isPositive: newClientsThisMonth >= lastMonthNewClients
  };

  return {
    totalClients,
    newClientsThisMonth,
    activeClients,
    clientsByType,
    clientTrend
  };
};

export const fetchVisitKPIs = async (): Promise<VisitKPIs> => {
  const { data: visits } = await supabase
    .from('visits')
    .select('date, statut, created_at, property_id');

  const currentMonth = new Date();
  currentMonth.setDate(1);
  
  const totalVisitsThisMonth = visits?.filter(v => 
    new Date(v.created_at) >= currentMonth
  ).length || 0;

  const today = new Date().toISOString().split('T')[0];
  const scheduledToday = visits?.filter(v => 
    v.date === today && v.statut === 'programmee'
  ).length || 0;

  const completedVisits = visits?.filter(v => v.statut === 'effectuee').length || 0;

  // Calculate visit to sale conversion
  const { data: soldProperties } = await supabase
    .from('transactions')
    .select('property_id')
    .eq('etape', 'finalise');

  const visitedPropertyIds = [...new Set(visits?.map(v => v.property_id))];
  const soldPropertyIds = soldProperties?.map(t => t.property_id) || [];
  const visitToSaleConversion = visitedPropertyIds.length > 0 
    ? (soldPropertyIds.filter(id => visitedPropertyIds.includes(id)).length / visitedPropertyIds.length) * 100 
    : 0;

  // Average visits per property
  const { data: properties } = await supabase
    .from('properties')
    .select('id');
  
  const totalProperties = properties?.length || 0;
  const totalVisits = visits?.length || 0;
  const averageVisitsPerProperty = totalProperties > 0 ? totalVisits / totalProperties : 0;

  // Calculate visit trend
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  lastMonth.setDate(1);
  
  const lastMonthVisits = visits?.filter(v => {
    const visitDate = new Date(v.created_at);
    return visitDate >= lastMonth && visitDate < currentMonth;
  }).length || 0;

  const visitTrend = {
    percentage: lastMonthVisits > 0 ? Math.abs(((totalVisitsThisMonth - lastMonthVisits) / lastMonthVisits) * 100) : 0,
    isPositive: totalVisitsThisMonth >= lastMonthVisits
  };

  return {
    totalVisitsThisMonth,
    scheduledToday,
    completedVisits,
    visitToSaleConversion,
    averageVisitsPerProperty,
    visitTrend
  };
};

export const fetchTransactionPipeline = async (): Promise<TransactionPipeline> => {
  const { data: transactions } = await supabase
    .from('transactions')
    .select('etape, valeur');

  const pipeline = transactions?.reduce((acc, transaction) => {
    const stage = transaction.etape;
    acc[stage] = (acc[stage] || 0) + 1;
    return acc;
  }, {} as any) || {};

  const totalValue = transactions?.reduce((sum, t) => sum + (t.valeur || 0), 0) || 0;

  return {
    prospection: pipeline.prospection || 0,
    qualification: pipeline.qualification || 0,
    negotiation: pipeline.negotiation || 0,
    signature: pipeline.signature || 0,
    finalise: pipeline.finalise || 0,
    totalValue
  };
};

export const fetchDashboardAlerts = async (): Promise<DashboardAlerts[]> => {
  // Generate dynamic alerts based on data
  const alerts: DashboardAlerts[] = [];
  
  // Check for upcoming visits today
  const today = new Date().toISOString().split('T')[0];
  const { data: todayVisits } = await supabase
    .from('visits')
    .select('*')
    .eq('date', today)
    .eq('statut', 'programmee');

  if (todayVisits && todayVisits.length > 0) {
    alerts.push({
      id: 'today-visits',
      type: 'info',
      title: 'Visites programmées',
      message: `${todayVisits.length} visite(s) programmée(s) aujourd'hui`,
      priority: 'medium',
      createdAt: new Date().toISOString()
    });
  }

  // Check for properties without visits in 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data: recentVisits } = await supabase
    .from('visits')
    .select('property_id')
    .gte('created_at', thirtyDaysAgo.toISOString());

  const { data: availableProperties } = await supabase
    .from('properties')
    .select('id, titre')
    .eq('statut', 'disponible');

  const visitedPropertyIds = recentVisits?.map(v => v.property_id) || [];
  const unvisitedProperties = availableProperties?.filter(p => 
    !visitedPropertyIds.includes(p.id)
  ) || [];

  if (unvisitedProperties.length > 5) {
    alerts.push({
      id: 'unvisited-properties',
      type: 'warning',
      title: 'Propriétés sans visites',
      message: `${unvisitedProperties.length} propriétés n'ont pas reçu de visites depuis 30 jours`,
      priority: 'high',
      createdAt: new Date().toISOString()
    });
  }

  return alerts.slice(0, 5); // Limit to 5 alerts
};

export const fetchAgentPerformance = async (): Promise<AgentPerformance[]> => {
  const [{ data: visits }, { data: transactions }] = await Promise.all([
    supabase.from('visits').select('agent'),
    supabase.from('transactions').select('agent, valeur, etape').eq('etape', 'finalise'),
  ]);

  const agentMap: Record<string, AgentPerformance> = {};

  for (const v of visits || []) {
    if (!agentMap[v.agent]) agentMap[v.agent] = { agent: v.agent, visits: 0, deals: 0, revenue: 0 };
    agentMap[v.agent].visits += 1;
  }
  for (const t of transactions || []) {
    if (!agentMap[t.agent]) agentMap[t.agent] = { agent: t.agent, visits: 0, deals: 0, revenue: 0 };
    agentMap[t.agent].deals += 1;
    agentMap[t.agent].revenue += t.valeur || 0;
  }

  return Object.values(agentMap).sort((a, b) => b.deals - a.deals || b.visits - a.visits);
};

export const fetchTopVisitedProperties = async (): Promise<TopVisitedProperty[]> => {
  const { data: visits } = await supabase
    .from('visits')
    .select('property_id, propriete_titre, propriete_adresse');

  if (!visits) return [];

  const counts: Record<string, TopVisitedProperty> = {};
  for (const v of visits) {
    if (!v.property_id) continue;
    if (!counts[v.property_id]) {
      counts[v.property_id] = {
        id: v.property_id,
        titre: v.propriete_titre,
        city: v.propriete_adresse,
        visitCount: 0,
      };
    }
    counts[v.property_id].visitCount += 1;
  }

  return Object.values(counts)
    .sort((a, b) => b.visitCount - a.visitCount)
    .slice(0, 8);
};

export const fetchEnhancedDashboardData = async (): Promise<EnhancedDashboardData> => {
  const [
    propertyKPIs,
    salesKPIs,
    clientKPIs,
    visitKPIs,
    transactionPipeline,
    alerts,
    agentPerformance,
    topVisitedProperties,
  ] = await Promise.all([
    fetchPropertyKPIs(),
    fetchSalesKPIs(),
    fetchClientKPIs(),
    fetchVisitKPIs(),
    fetchTransactionPipeline(),
    fetchDashboardAlerts(),
    fetchAgentPerformance(),
    fetchTopVisitedProperties(),
  ]);

  // Fetch monthly data for charts
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    
    const { startDate, endDate } = getMonthDateRange(year, month);
    
    const [propertiesData, salesData, visitsData, revenueData] = await Promise.all([
      supabase.from('properties').select('id').gte('created_at', startDate).lt('created_at', endDate),
      supabase.from('transactions').select('id').eq('etape', 'finalise').gte('created_at', startDate).lt('created_at', endDate),
      supabase.from('visits').select('id').gte('created_at', startDate).lt('created_at', endDate),
      supabase.from('transactions').select('valeur').eq('etape', 'finalise').gte('created_at', startDate).lt('created_at', endDate)
    ]);
    
    monthlyData.push({
      month: date.toLocaleDateString('fr-FR', { month: 'short' }),
      properties: propertiesData.data?.length || 0,
      sales: salesData.data?.length || 0,
      visits: visitsData.data?.length || 0,
      revenue: revenueData.data?.reduce((sum, t) => sum + (t.valeur || 0), 0) || 0
    });
  }

  return {
    propertyKPIs,
    salesKPIs,
    clientKPIs,
    visitKPIs,
    transactionPipeline,
    alerts,
    monthlyData,
    agentPerformance,
    topVisitedProperties,
  };
};