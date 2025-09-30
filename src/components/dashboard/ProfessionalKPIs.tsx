import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Home, Users, Eye, TrendingUp, TrendingDown, DollarSign, Calendar, Target, Building2, HandCoins } from 'lucide-react';
import { PropertyKPIs, SalesKPIs, ClientKPIs, VisitKPIs } from '@/types/enhancedDashboard';
import { formatCurrencyFCFA } from '@/utils/dashboardUtils';
interface ProfessionalKPIsProps {
  propertyKPIs: PropertyKPIs;
  salesKPIs: SalesKPIs;
  clientKPIs: ClientKPIs;
  visitKPIs: VisitKPIs;
}
const ProfessionalKPIs = ({
  propertyKPIs,
  salesKPIs,
  clientKPIs,
  visitKPIs
}: ProfessionalKPIsProps) => {
  const kpiCards = [{
    title: "Gestion des Biens",
    value: propertyKPIs.totalProperties,
    subtitle: `${propertyKPIs.availableProperties} disponibles`,
    icon: Building2,
    trend: propertyKPIs.salesTrend,
    color: "from-blue-500 to-blue-600",
    details: `${propertyKPIs.soldThisMonth} vendus ce mois`
  }, {
    title: "Chiffre d'Affaires",
    value: formatCurrencyFCFA(salesKPIs.monthlyRevenue),
    subtitle: `${salesKPIs.totalDeals} transactions`,
    icon: DollarSign,
    trend: salesKPIs.revenueTrend,
    color: "from-emerald-500 to-emerald-600",
    details: `Taux conversion: ${salesKPIs.conversionRate.toFixed(1)}%`
  }, {
    title: "Portfolio Client",
    value: clientKPIs.totalClients,
    subtitle: `${clientKPIs.newClientsThisMonth} nouveaux`,
    icon: Users,
    trend: clientKPIs.clientTrend,
    color: "from-purple-500 to-purple-600",
    details: `${clientKPIs.activeClients} actifs`
  }, {
    title: "Activité Visites",
    value: visitKPIs.totalVisitsThisMonth,
    subtitle: `${visitKPIs.scheduledToday} aujourd'hui`,
    icon: Eye,
    trend: visitKPIs.visitTrend,
    color: "from-orange-500 to-orange-600",
    details: `${visitKPIs.visitToSaleConversion.toFixed(1)}% conversion`
  }, {
    title: "Valeur Portfolio",
    value: formatCurrencyFCFA(propertyKPIs.totalValue),
    subtitle: `Prix moyen: ${formatCurrencyFCFA(propertyKPIs.averagePrice)}`,
    icon: Target,
    trend: {
      percentage: 0,
      isPositive: true
    },
    color: "from-indigo-500 to-indigo-600",
    details: `${propertyKPIs.underNegotiation} en négociation`
  }, {
    title: "Performance Commerciale",
    value: formatCurrencyFCFA(salesKPIs.averageDealValue),
    subtitle: "Valeur moyenne/deal",
    icon: HandCoins,
    trend: salesKPIs.revenueTrend,
    color: "from-teal-500 to-teal-600",
    details: `${visitKPIs.completedVisits} visites réalisées`
  }];
  return;
};
export default ProfessionalKPIs;