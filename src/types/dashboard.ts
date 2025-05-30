
export interface DashboardData {
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
