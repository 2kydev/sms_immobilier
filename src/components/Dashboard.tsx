
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const Dashboard = () => {
  const propertyData = [
    { name: 'Appartements', value: 45, color: '#1e40af' },
    { name: 'Maisons', value: 32, color: '#b59f3b' },
    { name: 'Terrains', value: 23, color: '#6b7280' }
  ];

  const monthlyData = [
    { month: 'Jan', transactions: 12, revenue: 2400000 },
    { month: 'Fév', transactions: 15, revenue: 3200000 },
    { month: 'Mar', transactions: 18, revenue: 3800000 },
    { month: 'Avr', transactions: 22, revenue: 4500000 },
    { month: 'Mai', transactions: 19, revenue: 4100000 }
  ];

  const clientTypes = [
    { type: 'Acheteurs', count: 156 },
    { type: 'Vendeurs', count: 89 },
    { type: 'Locataires', count: 234 },
    { type: 'Prospects', count: 67 }
  ];

  const upcomingVisits = [
    { id: 1, client: 'Jean Martin', property: 'Appartement 3P - Centre ville', time: '14:00', agent: 'Marie Dupont' },
    { id: 2, client: 'Sophie Bernard', property: 'Maison 5P - Quartier résidentiel', time: '16:30', agent: 'Pierre Leroy' },
    { id: 3, client: 'Thomas Dubois', property: 'Studio - Proche université', time: '17:45', agent: 'Marie Dupont' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Tableau de Bord</h1>
        <div className="text-sm text-gray-500">
          Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Propriétés Actives</CardTitle>
            <div className="h-4 w-4 text-primary">🏠</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">127</div>
            <p className="text-xs text-green-600">+12% ce mois</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Visites Cette Semaine</CardTitle>
            <div className="h-4 w-4 text-primary">📅</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">23</div>
            <p className="text-xs text-blue-600">5 aujourd'hui</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">CA du Mois</CardTitle>
            <div className="h-4 w-4 text-accent">💰</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">4,1M€</div>
            <p className="text-xs text-green-600">+8% vs mois dernier</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Nouveaux Clients</CardTitle>
            <div className="h-4 w-4 text-primary">👥</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">34</div>
            <p className="text-xs text-green-600">+15% ce mois</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition des propriétés */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition des Propriétés</CardTitle>
            <CardDescription>Par type de bien immobilier</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={propertyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {propertyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {propertyData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Évolution mensuelle */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution du Chiffre d'Affaires</CardTitle>
            <CardDescription>Transactions et revenus par mois</CardDescription>
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
                    name === 'revenue' ? `${(value as number / 1000000).toFixed(1)}M€` : value,
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Segmentation clients */}
        <Card>
          <CardHeader>
            <CardTitle>Segmentation des Clients</CardTitle>
            <CardDescription>Répartition par type de client</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={clientTypes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#1e40af" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Visites à venir */}
        <Card>
          <CardHeader>
            <CardTitle>Visites Programmées Aujourd'hui</CardTitle>
            <CardDescription>Planning des visites</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingVisits.map((visit) => (
              <div key={visit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{visit.client}</p>
                  <p className="text-xs text-gray-600">{visit.property}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-primary">{visit.time}</p>
                  <p className="text-xs text-gray-500">{visit.agent}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
