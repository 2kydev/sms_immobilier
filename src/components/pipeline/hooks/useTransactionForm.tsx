
import { useState, useEffect } from 'react';
import { Transaction } from '../types';

interface UseTransactionFormProps {
  transaction: Transaction | null;
}

export const useTransactionForm = ({ transaction }: UseTransactionFormProps) => {
  const [formData, setFormData] = useState({
    valeur: '',
    agent: 'Marie Dupont',
    etape: 'prospect',
    notes: '',
    probabilite: '25'
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        valeur: transaction.id ? transaction.valeur.toString() : '',
        agent: transaction.agent || 'Marie Dupont',
        etape: transaction.etape || 'prospect',
        notes: transaction.notes || '',
        probabilite: transaction.probabilite?.toString() || '25'
      });
    }
  }, [transaction]);

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const createTransactionData = (
    selectedClientId: string,
    selectedPropertyId: string,
    transaction: Transaction | null
  ) => {
    const currentDate = new Date().toISOString().split('T')[0];
    
    return {
      client_id: selectedClientId,
      property_id: selectedPropertyId,
      valeur: Number(formData.valeur),
      agent: formData.agent,
      etape: formData.etape,
      notes: formData.notes,
      probabilite: Number(formData.probabilite),
      derniere_activite: currentDate,
      date_creation: transaction?.id ? transaction.date_creation : currentDate
    };
  };

  return {
    formData,
    updateFormData,
    createTransactionData
  };
};
