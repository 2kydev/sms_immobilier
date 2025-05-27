import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import DashboardStats from './dashboard/DashboardStats';
import UserProfile from './dashboard/UserProfile';
import UserPreferences from './dashboard/UserPreferences';
const Dashboard = () => {
  const propertyData = [{
    name: 'Appartements',
    value: 68,
    color: '#1e40af'
  }, {
    name: 'Maisons',
    value: 45,
    color: '#b59f3b'
  }, {
    name: 'Terrains',
    value: 28,
    color: '#6b7280'
  }, {
    name: 'Locaux commerciaux',
    value: 15,
    color: '#dc2626'
  }];
  const monthlyData = [{
    month: 'Jan',
    transactions: 18,
    revenue: 3200000
  }, {
    month: 'Fév',
    transactions: 22,
    revenue: 4100000
  }, {
    month: 'Mar',
    transactions: 25,
    revenue: 4800000
  }, {
    month: 'Avr',
    transactions: 28,
    revenue: 5200000
  }, {
    month: 'Mai',
    transactions: 31,
    revenue: 5900000
  }, {
    month: 'Jun',
    transactions: 26,
    revenue: 4700000
  }];
  const clientTypes = [{
    type: 'Acheteurs',
    count: 189
  }, {
    type: 'Vendeurs',
    count: 124
  }, {
    type: 'Locataires',
    count: 267
  }, {
    type: 'Prospects',
    count: 95
  }];
  const upcomingVisits = [{
    id: 1,
    client: 'Marie Dubois',
    property: 'Villa 6P - Quartier résidentiel',
    time: '09:30',
    agent: 'Sophie Martin'
  }, {
    id: 2,
    client: 'Jean-Pierre Moreau',
    property: 'Appartement 4P - Centre ville',
    time: '11:00',
    agent: 'Thomas Leroy'
  }, {
    id: 3,
    client: 'Caroline Blanc',
    property: 'Maison 5P - Proche écoles',
    time: '14:30',
    agent: 'Marie Dupont'
  }, {
    id: 4,
    client: 'Alexandre Rousseau',
    property: 'Studio - Campus universitaire',
    time: '16:15',
    agent: 'Pierre Bernard'
  }, {
    id: 5,
    client: 'Isabelle Garcia',
    property: 'Duplex 3P - Vue mer',
    time: '17:45',
    agent: 'Sophie Martin'
  }];
  const recentActivity = [{
    id: 1,
    action: 'Nouvelle visite programmée',
    client: 'M. Durand',
    time: '2h',
    type: 'visit'
  }, {
    id: 2,
    action: 'Offre acceptée',
    property: 'Appartement T3 - Voltaire',
    time: '4h',
    type: 'offer'
  }, {
    id: 3,
    action: 'Nouveau prospect enregistré',
    client: 'Mme Leblanc',
    time: '6h',
    type: 'client'
  }, {
    id: 4,
    action: 'Propriété mise en ligne',
    property: 'Villa T5 - Les Jardins',
    time: '1j',
    type: 'property'
  }];
  return <div className="space-y-6">
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
      

      {/* Real-time KPIs */}
      <DashboardStats />

      {/* KPIs */}
      

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition des propriétés */}
        

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
                <Tooltip formatter={(value, name) => [name === 'revenue' ? `${((value as number) / 1000000).toFixed(1)}M€` : value, name === 'revenue' ? 'Chiffre d\'affaires' : 'Transactions']} />
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
            {upcomingVisits.map(visit => <div key={visit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div>
                  <p className="font-medium text-sm">{visit.client}</p>
                  <p className="text-xs text-gray-600 truncate">{visit.property}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-primary">{visit.time}</p>
                  <p className="text-xs text-gray-500">{visit.agent}</p>
                </div>
              </div>)}
          </CardContent>
        </Card>

        {/* Activité récente */}
        <Card>
          <CardHeader>
            <CardTitle>Activité Récente</CardTitle>
            <CardDescription>Dernières actions dans le CRM</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-80 overflow-y-auto">
            {recentActivity.map(activity => <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 ${activity.type === 'visit' ? 'bg-blue-500' : activity.type === 'offer' ? 'bg-green-500' : activity.type === 'client' ? 'bg-purple-500' : 'bg-yellow-500'}`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-gray-600">
                    {activity.client || activity.property}
                  </p>
                  <p className="text-xs text-gray-400">Il y a {activity.time}</p>
                </div>
              </div>)}
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default Dashboard;