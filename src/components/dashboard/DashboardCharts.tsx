
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, LabelList } from 'recharts';

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

const DashboardCharts = ({
  propertyTypes,
  monthlyData,
  clientTypes
}: DashboardChartsProps) => {
  // Préparer les données pour le graphique en barres avec pourcentages
  const totalClients = clientTypes.reduce((sum, item) => sum + item.count, 0);
  const clientTypesWithPercentage = clientTypes.map(item => ({
    ...item,
    percentage: totalClients > 0 ? (item.count / totalClients * 100).toFixed(1) : 0
  }));

  const COLORS = ['#1e40af', '#b59f3b', '#6b7280', '#dc2626', '#059669'];

  const CustomLabel = (props: any) => {
    const {
      x,
      y,
      width,
      height,
      payload
    } = props;

    // Vérifier que payload existe et a une propriété percentage
    if (!payload || !payload.percentage) {
      return null;
    }

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
            <CardDescription>Ventes réalisées sur 6 mois (en FCFA)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis 
                  orientation="left"
                  tickFormatter={(value) => {
                    if (value >= 1000000) {
                      return `${(value / 1000000).toFixed(1)}M`;
                    }
                    if (value >= 1000) {
                      return `${(value / 1000).toFixed(0)}k`;
                    }
                    return value.toString();
                  }}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' 
                      ? `${((value as number) / 1000000).toFixed(1)}M FCFA` 
                      : value, 
                    name === 'revenue' ? 'CA réalisé' : 'Ventes'
                  ]} 
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#b59f3b" 
                  strokeWidth={3}
                  dot={{ fill: '#b59f3b', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default DashboardCharts;
