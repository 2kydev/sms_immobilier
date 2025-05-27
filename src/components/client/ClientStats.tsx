
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Client } from './types';

interface ClientStatsProps {
  clients: Client[];
}

const ClientStats: React.FC<ClientStatsProps> = ({ clients }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-primary">{clients.length}</div>
          <p className="text-sm text-gray-600">Total Clients</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-green-600">{clients.filter(c => c.type === 'acheteur').length}</div>
          <p className="text-sm text-gray-600">Acheteurs</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-blue-600">{clients.filter(c => c.type === 'vendeur').length}</div>
          <p className="text-sm text-gray-600">Vendeurs</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-purple-600">{clients.filter(c => c.type === 'locataire').length}</div>
          <p className="text-sm text-gray-600">Locataires</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-orange-600">{clients.filter(c => c.type === 'prospect').length}</div>
          <p className="text-sm text-gray-600">Prospects</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientStats;
