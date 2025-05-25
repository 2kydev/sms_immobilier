import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import DashboardStats from './dashboard/DashboardStats';
import UserProfile from './dashboard/UserProfile';
import UserPreferences from './dashboard/UserPreferences';

const Dashboard = () => {
  const propertyData = [
    { name: 'Appartements', value: 68, color: '#1e40af' },
    { name: 'Maisons', value: 45, color: '#b59f3b' },
    { name: 'Terrains', value: 28, color: '#6b7280' },
    { name: 'Locaux commerciaux', value: 15, color: '#dc2626' }
  ];

  const monthlyData = [
    { month: 'Jan', transactions: 18, revenue: 3200000 },
    { month: 'Fév', transactions: 22, revenue: 4100000 },
    { month: 'Mar', transactions: 25, revenue: 4800000 },
    { month: 'Avr', transactions: 28, revenue: 5200000 },
    { month: 'Mai', transactions: 31, revenue: 5900000 },
    { month: 'Jun', transactions: 26, revenue: 4700000 }
  ];

  const clientTypes = [
    { type: 'Acheteurs', count: 189 },
    { type: 'Vendeurs', count: 124 },
    { type: 'Locataires', count: 267 },
    { type: 'Prospects', count: 95 }
  ];

  const upcomingVisits = [
    { id: 1, client: 'Marie Dubois', property: 'Villa 6P - Quartier résidentiel', time: '09:30', agent: 'Sophie Martin' },
    { id: 2, client: 'Jean-Pierre Moreau', property: 'Appartement 4P - Centre ville', time: '11:00', agent: 'Thomas Leroy' },
    { id: 3, client: 'Caroline Blanc', property: 'Maison 5P - Proche écoles', time: '14:30', agent: 'Marie Dupont' },
    { id: 4, client: 'Alexandre Rousseau', property: 'Studio - Campus universitaire', time: '16:15', agent: 'Pierre Bernard' },
    { id: 5, client: 'Isabelle Garcia', property: 'Duplex 3P - Vue mer', time: '17:45', agent: 'Sophie Martin' }
  ];

  const recentActivity = [
    { id: 1, action: 'Nouvelle visite programmée', client: 'M. Durand', time: '2h', type: 'visit' },
    { id: 2, action: 'Offre acceptée', property: 'Appartement T3 - Voltaire', time: '4h', type: 'offer' },
    { id: 3, action: 'Nouveau prospect enregistré', client: 'Mme Leblanc', time: '6h', type: 'client' },
    { id: 4, action: 'Propriété mise en ligne', property: 'Villa T5 - Les Jardins', time: '1j', type: 'property' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Tableau de Bord</h1>
        <div className="text-sm text-gray-500">
          Dernière mise à jour: {new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* User Profile and Preferences Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <UserProfile />
        </div>
        <div>
          <UserPreferences />
        </div>
      </div>

      {/* Real-time KPIs */}
      <DashboardStats />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-hover border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Propriétés Actives</CardTitle>
            <div className="h-4 w-4 text-blue-600">🏠</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">156</div>
            <p className="text-xs text-green-600">+18% ce mois</p>
          </CardContent>
        </Card>

        <Card className="card-hover border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Visites Cette Semaine</CardTitle>
            <div className="h-4 w-4 text-green-600">📅</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">31</div>
            <p className="text-xs text-blue-600">8 aujourd'hui</p>
          </CardContent>
        </Card>

        <Card className="card-hover border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">CA du Mois</CardTitle>
            <div className="h-4 w-4 text-yellow-600">💰</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">5,9M€</div>
            <p className="text-xs text-green-600">+13% vs mois dernier</p>
          </CardContent>
        </Card>

        <Card className="card-hover border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Nouveaux Clients</CardTitle>
            <div className="h-4 w-4 text-purple-600">👥</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">42</div>
            <p className="text-xs text-green-600">+22% ce mois</p>
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
            <div className="flex justify-center gap-4 mt-4 flex-wrap">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
          <CardContent className="space-y-3 max-h-80 overflow-y-auto">
            {upcomingVisits.map((visit) => (
              <div key={visit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div>
                  <p className="font-medium text-sm">{visit.client}</p>
                  <p className="text-xs text-gray-600 truncate">{visit.property}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-primary">{visit.time}</p>
                  <p className="text-xs text-gray-500">{visit.agent}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Activité récente */}
        <Card>
          <CardHeader>
            <CardTitle>Activité Récente</CardTitle>
            <CardDescription>Dernières actions dans le CRM</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-80 overflow-y-auto">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'visit' ? 'bg-blue-500' :
                  activity.type === 'offer' ? 'bg-green-500' :
                  activity.type === 'client' ? 'bg-purple-500' : 'bg-yellow-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-gray-600">
                    {activity.client || activity.property}
                  </p>
                  <p className="text-xs text-gray-400">Il y a {activity.time}</p>
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
