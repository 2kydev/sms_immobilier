export interface PropertyKPIs {
  totalProperties: number;
  availableProperties: number;
  soldThisMonth: number;
  underNegotiation: number;
  averagePrice: number;
  totalValue: number;
  salesTrend: {
    percentage: number;
    isPositive: boolean;
  };
}

export interface SalesKPIs {
  monthlyRevenue: number;
  lastMonthRevenue: number;
  totalDeals: number;
  averageDealValue: number;
  conversionRate: number;
  revenueTrend: {
    percentage: number;
    isPositive: boolean;
  };
}

export interface ClientKPIs {
  totalClients: number;
  newClientsThisMonth: number;
  activeClients: number;
  clientsByType: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  clientTrend: {
    percentage: number;
    isPositive: boolean;
  };
}

export interface VisitKPIs {
  totalVisitsThisMonth: number;
  scheduledToday: number;
  completedVisits: number;
  visitToSaleConversion: number;
  averageVisitsPerProperty: number;
  visitTrend: {
    percentage: number;
    isPositive: boolean;
  };
}

export interface TransactionPipeline {
  prospection: number;
  qualification: number;
  negotiation: number;
  signature: number;
  finalise: number;
  totalValue: number;
}

export interface DashboardAlerts {
  id: string;
  type: 'warning' | 'info' | 'error' | 'success';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
}

export interface EnhancedDashboardData {
  propertyKPIs: PropertyKPIs;
  salesKPIs: SalesKPIs;
  clientKPIs: ClientKPIs;
  visitKPIs: VisitKPIs;
  transactionPipeline: TransactionPipeline;
  alerts: DashboardAlerts[];
  monthlyData: Array<{
    month: string;
    properties: number;
    sales: number;
    visits: number;
    revenue: number;
  }>;
}