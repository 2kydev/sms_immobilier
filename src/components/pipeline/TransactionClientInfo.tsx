
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Client } from './types';

interface TransactionClientInfoProps {
  clients: Client[];
  selectedClientId: string;
  onClientChange: (clientId: string) => void;
}

const TransactionClientInfo = ({ 
  clients, 
  selectedClientId, 
  onClientChange 
}: TransactionClientInfoProps) => {
  const getSelectedClient = () => {
    return clients.find(client => client.id === selectedClientId);
  };

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="clientSelect">Client</Label>
        <Select value={selectedClientId} onValueChange={onClientChange}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un client" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.prenom} {client.nom}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="clientTelephone">Téléphone</Label>
        <Input 
          id="clientTelephone" 
          value={getSelectedClient()?.telephone || ''} 
          readOnly 
          className="bg-gray-50"
        />
      </div>
    </>
  );
};

export default TransactionClientInfo;
