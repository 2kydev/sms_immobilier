
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Transaction, Client, Property } from './types';
import { useTransactionForm } from './hooks/useTransactionForm';
import TransactionClientInfo from './TransactionClientInfo';
import TransactionPropertyInfo from './TransactionPropertyInfo';
import TransactionFormFields from './TransactionFormFields';

interface Agent {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  statut: string;
}

interface TransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  clients: Client[];
  properties: Property[];
  agents: Agent[];
  selectedClientId: string;
  selectedPropertyId: string;
  onClientChange: (clientId: string) => void;
  onPropertyChange: (propertyId: string) => void;
  onSave: (transactionData: any) => void;
}

const TransactionDialog = ({ 
  isOpen, 
  onClose, 
  transaction, 
  clients, 
  properties, 
  agents,
  selectedClientId, 
  selectedPropertyId, 
  onClientChange, 
  onPropertyChange,
  onSave
}: TransactionDialogProps) => {
  const { formData, updateFormData, createTransactionData } = useTransactionForm({ transaction });

  const handleSubmit = () => {
    if (!formData.agent) {
      alert('Veuillez sélectionner un agent responsable');
      return;
    }

    const transactionData = createTransactionData(selectedClientId, selectedPropertyId, transaction);
    onSave(transactionData);
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
            <TransactionClientInfo
              clients={clients}
              selectedClientId={selectedClientId}
              onClientChange={onClientChange}
            />

            <TransactionPropertyInfo
              properties={properties}
              selectedPropertyId={selectedPropertyId}
              onPropertyChange={onPropertyChange}
            />

            <TransactionFormFields
              formData={formData}
              onFieldChange={updateFormData}
              agents={agents}
            />

            <div className="md:col-span-2 flex gap-2 pt-4">
              <Button className="flex-1" onClick={handleSubmit}>
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
