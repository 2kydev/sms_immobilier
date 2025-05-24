
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ClientFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: string;
  setFilterType: (type: string) => void;
}

const ClientFilters: React.FC<ClientFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Rechercher un client (nom, prénom, email)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Type de client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tous">Tous les types</SelectItem>
              <SelectItem value="acheteur">Acheteurs</SelectItem>
              <SelectItem value="vendeur">Vendeurs</SelectItem>
              <SelectItem value="locataire">Locataires</SelectItem>
              <SelectItem value="prospect">Prospects</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientFilters;
