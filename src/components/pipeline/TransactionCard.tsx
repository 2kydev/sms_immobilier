
import React from 'react';
import { Card } from '@/components/ui/card';
import { Transaction, Client, Property } from './types';
import { formatAmount, getDaysInStage } from './utils';

interface TransactionCardProps {
  transaction: Transaction;
  clients: Client[];
  properties: Property[];
  onClick: (transaction: Transaction) => void;
}

const TransactionCard = ({ transaction, clients, properties, onClick }: TransactionCardProps) => {
  const client = clients.find(c => c.id === transaction.client_id);
  const property = properties.find(p => p.id === transaction.property_id);

  return (
    <Card 
      className="p-3 cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-primary"
      onClick={() => onClick(transaction)}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="font-medium text-sm">
            {client ? `${client.prenom} ${client.nom}` : 'Client non défini'}
          </p>
          <span className="text-xs text-gray-500">
            {getDaysInStage(transaction.derniere_activite)}j
          </span>
        </div>
        
        <p className="text-xs text-gray-600 line-clamp-1">
          {property ? property.titre : 'Propriété non définie'}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-primary">
            {formatAmount(transaction.valeur)}
          </span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600">{transaction.probabilite}%</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{transaction.agent}</span>
          <span>{client ? client.telephone : 'N/A'}</span>
        </div>
      </div>
    </Card>
  );
};

export default TransactionCard;
