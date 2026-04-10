import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ClientStatsData {
  total: number;
  acheteur: number;
  vendeur: number;
  locataire: number;
  prospect: number;
}

interface ClientStatsProps {
  stats: ClientStatsData;
}

const ClientStats: React.FC<ClientStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-primary">{stats.total}</div>
          <p className="text-sm text-gray-600">Total Clients</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-green-600">{stats.acheteur}</div>
          <p className="text-sm text-gray-600">Acheteurs</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-blue-600">{stats.vendeur}</div>
          <p className="text-sm text-gray-600">Vendeurs</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-purple-600">{stats.locataire}</div>
          <p className="text-sm text-gray-600">Locataires</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-orange-600">{stats.prospect}</div>
          <p className="text-sm text-gray-600">Prospects</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientStats;
