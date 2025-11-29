import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Users, Calendar, TrendingUp } from 'lucide-react';
import { PropertyKPIs, ClientKPIs, VisitKPIs, SalesKPIs } from '@/types/enhancedDashboard';
import { formatCurrencyFCFA } from '@/utils/dashboardUtils';

interface SimplifiedKPIsProps {
  propertyKPIs: PropertyKPIs;
  clientKPIs: ClientKPIs;
  visitKPIs: VisitKPIs;
  salesKPIs: SalesKPIs;
}

const SimplifiedKPIs = ({ propertyKPIs, clientKPIs, visitKPIs, salesKPIs }: SimplifiedKPIsProps) => {
  const kpis = [
    {
      title: 'Gestion des Biens',
      value: propertyKPIs.totalProperties,
      subtitle: `${propertyKPIs.availableProperties} disponibles`,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Portfolio Client',
      value: clientKPIs.totalClients,
      subtitle: `+${clientKPIs.newClientsThisMonth} ce mois`,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Activité Visites',
      value: visitKPIs.totalVisitsThisMonth,
      subtitle: `${visitKPIs.scheduledToday} aujourd'hui`,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Performance Commerciale',
      value: formatCurrencyFCFA(salesKPIs.monthlyRevenue),
      subtitle: `${salesKPIs.totalDeals} transactions`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card key={kpi.title} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {kpi.title}
                  </p>
                  <p className="text-3xl font-bold text-foreground mb-1">
                    {kpi.value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {kpi.subtitle}
                  </p>
                </div>
                <div className={`${kpi.bgColor} p-3 rounded-lg`}>
                  <Icon className={`h-6 w-6 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default SimplifiedKPIs;
