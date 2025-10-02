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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {kpiCards.map((kpi, idx) => (
        <Card key={idx} className="overflow-hidden">
          <div className={`h-2 bg-gradient-to-r ${kpi.color}`} />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <kpi.icon className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">{kpi.title}</span>
              </div>
              <Badge variant={kpi.trend.isPositive ? 'default' : 'destructive'}>
                {kpi.trend.isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {kpi.trend.percentage.toFixed(1)}%
              </Badge>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-primary">{kpi.value}</div>
              <div className="text-sm text-muted-foreground">{kpi.subtitle}</div>
              <div className="text-xs text-muted-foreground mt-2">{kpi.details}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
export default ProfessionalKPIs;