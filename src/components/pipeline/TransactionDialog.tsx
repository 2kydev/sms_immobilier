
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Transaction, Client, Property, etapes } from './types';

interface TransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  clients: Client[];
  properties: Property[];
  selectedClientId: string;
  selectedPropertyId: string;
  onClientChange: (clientId: string) => void;
  onPropertyChange: (propertyId: string) => void;
  onSave: (transactionData: any) => void;
}

const TransactionDialog: React.FC<TransactionDialogProps> = ({
  isOpen,
  onClose,
  transaction,
  clients,
  properties,
  selectedClientId,
  selectedPropertyId,
  onClientChange,
  onPropertyChange,
  onSave
}) => {
  const [formData, setFormData] = useState({
    client_id: '',
    property_id: '',
    valeur: 0,
    agent: 'Marie Dupont',
    etape: 'prospect' as const,
    notes: '',
    probabilite: 25,
    derniere_activite: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (transaction?.id) {
      setFormData({
        client_id: transaction.client_id || '',
        property_id: transaction.property_id || '',
        valeur: transaction.valeur,
        agent: transaction.agent,
        etape: transaction.etape,
        notes: transaction.notes || '',
        probabilite: transaction.probabilite,
        derniere_activite: transaction.derniere_activite
      });
      onClientChange(transaction.client_id || '');
      onPropertyChange(transaction.property_id || '');
    } else {
      setFormData({
        client_id: '',
        property_id: '',
        valeur: 0,
        agent: 'Marie Dupont',
        etape: 'prospect',
        notes: '',
        probabilite: 25,
        derniere_activite: new Date().toISOString().split('T')[0]
      });
      onClientChange('');
      onPropertyChange('');
    }
  }, [transaction, onClientChange, onPropertyChange]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const transactionData = {
      ...formData,
      client_id: selectedClientId || null,
      property_id: selectedPropertyId || null,
    };

    onSave(transactionData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {transaction?.id ? 'Modifier la transaction' : 'Nouvelle transaction'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client">Client</Label>
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
            <Label htmlFor="property">Propriété</Label>
            <Select value={selectedPropertyId} onValueChange={onPropertyChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une propriété" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.titre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="valeur">Valeur (€)</Label>
            <Input
              id="valeur"
              type="number"
              value={formData.valeur}
              onChange={(e) => setFormData({ ...formData, valeur: Number(e.target.value) })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="etape">Étape</Label>
            <Select value={formData.etape} onValueChange={(value: any) => setFormData({ ...formData, etape: value })}>
              <SelectTrigger>
                <SelectValue />
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
          
          <div className="space-y-2">
            <Label htmlFor="probabilite">Probabilité (%)</Label>
            <Input
              id="probabilite"
              type="number"
              min="0"
              max="100"
              value={formData.probabilite}
              onChange={(e) => setFormData({ ...formData, probabilite: Number(e.target.value) })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notes sur la transaction..."
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              Enregistrer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDialog;
