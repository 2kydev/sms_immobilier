
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Client } from './types';
import { getTypeColor } from './utils';

interface ClientCardProps {
  client: Client;
  onClick: () => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ client, onClick }) => {
  return (
    <Card className="card-hover cursor-pointer" onClick={onClick}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {client.civilite} {client.prenom} {client.nom}
          </CardTitle>
          <Badge className={getTypeColor(client.type)}>
            {client.type}
          </Badge>
        </div>
        <CardDescription>{client.email}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <p><span className="font-medium">Téléphone:</span> {client.telephone}</p>
          <p><span className="font-medium">Adresse:</span> {client.adresse}</p>
          {client.preferred_city && (
            <p><span className="font-medium">Ville préférée:</span> {client.preferred_city}</p>
          )}
          {client.quartiers && client.quartiers.length > 0 && (
            <div>
              <span className="font-medium">Quartiers:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {client.quartiers.map((quartier, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {quartier}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {client.type_bien && (
            <div>
              <span className="font-medium">Types de biens:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {client.type_bien.split(',').map((type, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {client.budget_min && client.budget_max && (
            <p><span className="font-medium">Budget:</span> {client.budget_min.toLocaleString()}€ - {client.budget_max.toLocaleString()}€</p>
          )}
          {client.notes && (
            <p className="text-gray-600 italic">"{client.notes.substring(0, 50)}..."</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientCard;
