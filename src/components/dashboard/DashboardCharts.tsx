
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, YAxis, LabelList } from 'recharts';

interface DashboardChartsProps {
  propertyTypes: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  monthlyData: Array<{
    month: string;
    transactions: number;
    revenue: number;
  }>;
  clientTypes: Array<{
    type: string;
    count: number;
  }>;
}

const DashboardCharts = ({ propertyTypes, monthlyData, clientTypes }: DashboardChartsProps) => {
  // Préparer les données pour le graphique en secteurs avec pourcentages
  const totalClients = clientTypes.reduce((sum, item) => sum + item.count, 0);
  const clientTypesWithPercentage = clientTypes.map(item => ({
    ...item,
    percentage: totalClients > 0 ? ((item.count / totalClients) * 100).toFixed(1) : 0
  }));

  const COLORS = ['#1e40af', '#b59f3b', '#6b7280', '#dc2626', '#059669'];

  const CustomLabel = (props: any) => {
    const { x, y, width, height, value, payload } = props;
    return (
      <text
        x={x + width / 2}
        y={y + height / 2}
        fill="#fff"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="12"
        fontWeight="bold"
      >
        {payload.percentage}%
      </text>
    );
  };

  return (
    <>
      {/* Graphiques et données */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition des propriétés */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition des Propriétés</CardTitle>
            <CardDescription>Distribution par type de bien</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie 
                  data={propertyTypes} 
                  cx="50%" 
                  cy="50%" 
                  labelLine={false} 
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} 
                  outerRadius={80} 
                  fill="#8884d8" 
                  dataKey="value"
                >
                  {propertyTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Évolution mensuelle */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution du Chiffre d'Affaires</CardTitle>
            <CardDescription>Transactions et revenus sur 6 mois</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? `${((value as number) / 1000000).toFixed(1)}M€` : value, 
                    name === 'revenue' ? 'Chiffre d\'affaires' : 'Transactions'
                  ]} 
                />
                <Bar yAxisId="left" dataKey="transactions" fill="#1e40af" />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#b59f3b" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Nouvelle ligne avec segmentation clients (2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Segmentation clients - 2/3 de l'espace */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Segmentation des Clients</CardTitle>
            <CardDescription>Répartition par type de client</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={clientTypesWithPercentage} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value} clients`,
                    'Nombre de clients'
                  ]}
                />
                <Bar dataKey="count" fill="#1e40af">
                  <LabelList content={CustomLabel} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default DashboardCharts;
