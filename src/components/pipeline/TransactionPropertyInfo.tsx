
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Property } from './types';
import { formatAmount } from './utils';

interface TransactionPropertyInfoProps {
  properties: Property[];
  selectedPropertyId: string;
  onPropertyChange: (propertyId: string) => void;
}

const TransactionPropertyInfo = ({ 
  properties, 
  selectedPropertyId, 
  onPropertyChange 
}: TransactionPropertyInfoProps) => {
  return (
    <div className="space-y-2 md:col-span-2">
      <Label htmlFor="proprieteSelect">Propriété</Label>
      <Select value={selectedPropertyId} onValueChange={onPropertyChange}>
        <SelectTrigger>
          <SelectValue placeholder="Sélectionner une propriété" />
        </SelectTrigger>
        <SelectContent>
          {properties.map((property) => (
            <SelectItem key={property.id} value={property.id}>
              {property.titre} - {property.adresse} - {formatAmount(property.prix)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TransactionPropertyInfo;
