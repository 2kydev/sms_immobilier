
import { useState, useEffect } from 'react';
import { Transaction } from '../types';
import { useAuth } from '@/hooks/useAuth';

interface UseTransactionFormProps {
  transaction: Transaction | null;
}

export const useTransactionForm = ({ transaction }: UseTransactionFormProps) => {
  const { user } = useAuth();
  const defaultAgent = user?.email?.split('@')[0] || '';

  const [formData, setFormData] = useState({
    valeur: '',
    agent: defaultAgent,
    etape: 'prospect',
    notes: ''
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        valeur: transaction.id ? transaction.valeur.toString() : '',
        agent: transaction.agent || defaultAgent,
        etape: transaction.etape || 'prospect',
        notes: transaction.notes || ''
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
