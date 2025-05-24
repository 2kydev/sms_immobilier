
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface VisitStatusSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const VisitStatusSelect: React.FC<VisitStatusSelectProps> = ({ value, onChange, disabled = false }) => {
  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'planifiee': return 'bg-blue-100 text-blue-800';
      case 'realisee': return 'bg-green-100 text-green-800';
      case 'annulee': return 'bg-red-100 text-red-800';
      case 'reportee': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'planifiee': return 'Planifiée';
      case 'realisee': return 'Réalisée';
      case 'annulee': return 'Annulée';
      case 'reportee': return 'Reportée';
      default: return statut;
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Badge className={getStatutColor(value)}>
        {getStatutLabel(value)}
      </Badge>
      {!disabled && (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="planifiee">Planifiée</SelectItem>
            <SelectItem value="realisee">Réalisée</SelectItem>
            <SelectItem value="annulee">Annulée</SelectItem>
            <SelectItem value="reportee">Reportée</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default VisitStatusSelect;
