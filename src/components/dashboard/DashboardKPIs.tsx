import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Users, Eye, TrendingUp } from 'lucide-react';
import { formatCurrencyFCFA, getRevenueChange } from '@/utils/dashboardUtils';
interface DashboardKPIsProps {
  totalProperties: number;
  totalClients: number;
  weeklyVisits: number;
  monthlyRevenue: number;
  lastMonthRevenue: number;
}
const DashboardKPIs = ({
  totalProperties,
  totalClients,
  weeklyVisits,
  monthlyRevenue,
  lastMonthRevenue
}: DashboardKPIsProps) => {
  const revenueChange = getRevenueChange(monthlyRevenue, lastMonthRevenue);
  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Biens</p>
              <p className="text-3xl font-bold">{totalProperties}</p>
            </div>
            <Home className="h-8 w-8 text-blue-200" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Clients</p>
              <p className="text-3xl font-bold">{totalClients}</p>
            </div>
            <Users className="h-8 w-8 text-green-200" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-90 px-0 text-xs font-normal">Visites Cette Semaine</p>
              <p className="text-3xl font-bold">{weeklyVisits}</p>
            </div>
            <Eye className="h-8 w-8 text-purple-200" />
          </div>
        </CardContent>
      </Card>

      
    </div>;
};
export default DashboardKPIs;