import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { TransactionPipeline, EnhancedDashboardData } from '@/types/enhancedDashboard';
import { formatCurrencyFCFA } from '@/utils/dashboardUtils';
interface DashboardChartsProProps {
  transactionPipeline: TransactionPipeline;
  monthlyData: EnhancedDashboardData['monthlyData'];
  clientsByType: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
}
const DashboardChartsPro = ({
  transactionPipeline,
  monthlyData,
  clientsByType
}: DashboardChartsProProps) => {
  // Pipeline data for funnel chart
  const pipelineData = [{
    name: 'Prospection',
    count: transactionPipeline.prospection,
    color: '#3b82f6'
  }, {
    name: 'Qualification',
    count: transactionPipeline.qualification,
    color: '#8b5cf6'
  }, {
    name: 'Négociation',
    count: transactionPipeline.negotiation,
    color: '#f59e0b'
  }, {
    name: 'Signature',
    count: transactionPipeline.signature,
    color: '#10b981'
  }, {
    name: 'Finalisé',
    count: transactionPipeline.finalise,
    color: '#059669'
  }];

  // Colors for client types
  const clientColors = ['#1e40af', '#b59f3b', '#6b7280', '#dc2626', '#059669'];
  const CustomTooltip = ({
    active,
    payload,
    label
  }: any) => {
    if (active && payload && payload.length) {
      return <div className="bg-card border border-border rounded-lg p-3 shadow-md">
          <p className="font-medium text-card-foreground">{label}</p>
          {payload.map((entry: any, index: number) => <p key={index} className="text-sm" style={{
          color: entry.color
        }}>
              {entry.dataKey === 'revenue' ? `${entry.name}: ${formatCurrencyFCFA(entry.value)}` : `${entry.name}: ${entry.value}`}
            </p>)}
        </div>;
    }
    return null;
  };
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Évolution des ventes par mois */}
      <Card className="col-span-full lg:col-span-2">
        <CardHeader>
          <CardTitle>Évolution des ventes par mois</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="sales" 
                name="Biens vendus"
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Types de clients */}
      <Card>
        <CardHeader>
          <CardTitle>Types de clients</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={clientsByType}
                dataKey="count"
                nameKey="type"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry) => `${entry.type}: ${entry.count}`}
              >
                {clientsByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={clientColors[index % clientColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Revenue mensuel des ventes */}
      <Card className="col-span-full lg:col-span-3">
        <CardHeader>
          <CardTitle>Revenue mensuel des ventes</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                name="Revenue"
                stroke="hsl(var(--chart-2))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--chart-2))', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardChartsPro;