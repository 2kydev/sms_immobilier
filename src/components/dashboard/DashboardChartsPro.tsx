import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
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
  const pipelineData = [
    { name: 'Prospection', count: transactionPipeline.prospection, color: '#3b82f6' },
    { name: 'Qualification', count: transactionPipeline.qualification, color: '#8b5cf6' },
    { name: 'Négociation', count: transactionPipeline.negotiation, color: '#f59e0b' },
    { name: 'Signature', count: transactionPipeline.signature, color: '#10b981' },
    { name: 'Finalisé', count: transactionPipeline.finalise, color: '#059669' }
  ];

  // Colors for client types
  const clientColors = ['#1e40af', '#b59f3b', '#6b7280', '#dc2626', '#059669'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-md">
          <p className="font-medium text-card-foreground">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey === 'revenue' 
                ? `${entry.name}: ${formatCurrencyFCFA(entry.value)}`
                : `${entry.name}: ${entry.value}`
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pipeline des Transactions */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-primary">Pipeline Commercial</CardTitle>
          <p className="text-sm text-muted-foreground">
            Répartition des transactions par étape
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pipelineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {pipelineData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center">
            <div className="text-sm text-muted-foreground">
              Valeur totale: <span className="font-medium text-primary">
                {formatCurrencyFCFA(transactionPipeline.totalValue)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Évolution Mensuelle */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-primary">Évolution Mensuelle</CardTitle>
          <p className="text-sm text-muted-foreground">
            Performance sur les 6 derniers mois
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="properties" 
                stroke="#3b82f6" 
                strokeWidth={3}
                name="Nouveaux biens"
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="visits" 
                stroke="#f59e0b" 
                strokeWidth={3}
                name="Visites"
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="#10b981" 
                strokeWidth={3}
                name="Ventes"
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Répartition des Clients */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-primary">Segmentation Clientèle</CardTitle>
          <p className="text-sm text-muted-foreground">
            Répartition des clients par type
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={clientsByType}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  label={({ type, percentage }) => `${type}: ${percentage.toFixed(1)}%`}
                >
                  {clientsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={clientColors[index % clientColors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    `${value} clients`, 
                    'Nombre'
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="space-y-3">
              {clientsByType.map((item, index) => (
                <div key={item.type} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: clientColors[index % clientColors.length] }}
                    />
                    <span className="font-medium capitalize">{item.type}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">{item.count}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardChartsPro;