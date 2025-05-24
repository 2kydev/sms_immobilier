
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Transaction, Client, Property, etapes } from './types';
import { formatAmount } from './utils';

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
}

const TransactionDialog = ({ 
  isOpen, 
  onClose, 
  transaction, 
  clients, 
  properties, 
  selectedClientId, 
  selectedPropertyId, 
  onClientChange, 
  onPropertyChange 
}: TransactionDialogProps) => {
  const getSelectedClient = () => {
    return clients.find(client => client.id === selectedClientId);
  };

  const getSelectedProperty = () => {
    return properties.find(property => property.id === selectedPropertyId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {transaction?.id ? 'Modifier la transaction' : 'Nouvelle transaction'}
          </DialogTitle>
          <DialogDescription>
            Gérez les détails de la transaction
          </DialogDescription>
        </DialogHeader>
        
        {transaction && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label htmlFor="valeur">Montant (FCFA)</Label>
              <Input 
                id="valeur" 
                type="number" 
                defaultValue={transaction.id ? transaction.valeur : ''}
                placeholder="Saisir le montant"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="agent">Agent responsable</Label>
              <Select defaultValue={transaction.agent}>
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
              <Select defaultValue={transaction.etape}>
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

            <div className="space-y-2">
              <Label htmlFor="derniereActivite">Dernière activité</Label>
              <Input id="derniereActivite" type="date" defaultValue={transaction.derniereActivite} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Notes sur la transaction..." defaultValue={transaction.notes} />
            </div>

            <div className="md:col-span-2 flex gap-2 pt-4">
              <Button className="flex-1" onClick={onClose}>
                {transaction.id ? 'Mettre à jour' : 'Créer'}
              </Button>
              <Button variant="outline" onClick={onClose}>
                Annuler
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDialog;
