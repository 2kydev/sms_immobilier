
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { etapes } from './types';

interface TransactionFormFieldsProps {
  formData: {
    valeur: string;
    agent: string;
    etape: string;
    notes: string;
    probabilite: string;
  };
  onFieldChange: (field: string, value: string) => void;
}

const TransactionFormFields = ({ formData, onFieldChange }: TransactionFormFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="valeur">Montant (FCFA)</Label>
        <Input 
          id="valeur" 
          type="number" 
          value={formData.valeur}
          onChange={(e) => onFieldChange('valeur', e.target.value)}
          placeholder="Saisir le montant"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="probabilite">Probabilité (%)</Label>
        <Input 
          id="probabilite" 
          type="number" 
          min="0"
          max="100"
          value={formData.probabilite}
          onChange={(e) => onFieldChange('probabilite', e.target.value)}
          placeholder="Probabilité de réussite"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="agent">Agent responsable</Label>
        <Select value={formData.agent} onValueChange={(value) => onFieldChange('agent', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Agent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Marie Dupont">Marie Dupont</SelectItem>
            <SelectItem value="Pierre Leroy">Pierre Leroy</SelectItem>
            <SelectItem value="Sophie Martin">Sophie Martin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="etape">Étape actuelle</Label>
        <Select value={formData.etape} onValueChange={(value) => onFieldChange('etape', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Étape" />
          </SelectTrigger>
          <SelectContent>
            {etapes.map((etape) => (
              <SelectItem key={etape.key} value={etape.key}>
                {etape.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea 
          id="notes" 
          placeholder="Notes sur la transaction..." 
          value={formData.notes}
          onChange={(e) => onFieldChange('notes', e.target.value)}
        />
      </div>
    </>
  );
};

export default TransactionFormFields;
