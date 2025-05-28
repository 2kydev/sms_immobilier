
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface VisitFiltersProps {
  searchTerm: string;
  filterStatut: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
}

const VisitFilters: React.FC<VisitFiltersProps> = ({
  searchTerm,
  filterStatut,
  onSearchChange,
  onFilterChange
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Rechercher une visite (client, propriété)..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={filterStatut} onValueChange={onFilterChange}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tous">Tous les statuts</SelectItem>
              <SelectItem value="planifiee">Planifiée</SelectItem>
              <SelectItem value="realisee">Réalisée</SelectItem>
              <SelectItem value="annulee">Annulée</SelectItem>
              <SelectItem value="reportee">Reportée</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default VisitFilters;
