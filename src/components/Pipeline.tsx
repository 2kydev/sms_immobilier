import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Transaction, Client, Property, etapes } from './pipeline/types';
import PipelineMetrics from './pipeline/PipelineMetrics';
import PipelineStage from './pipeline/PipelineStage';
import TransactionDialog from './pipeline/TransactionDialog';

interface Agent {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  statut: string;
}

const Pipeline = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTransactions();
    fetchClients();
    fetchProperties();
    fetchAgents();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les transactions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, nom, prenom, telephone, email')
        .order('nom');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les clients",
        variant: "destructive"
      });
    }
  };

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, titre, prix, adresse, city, quartier')
        .eq('statut', 'disponible')
        .order('titre');

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les propriétés",
        variant: "destructive"
      });
    }
  };

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('nom', { ascending: true });

      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les agents",
        variant: "destructive"
      });
    }
  };

  const openTransactionDialog = (transaction?: Transaction) => {
    if (transaction) {
      setSelectedTransaction(transaction);
      const client = clients.find(c => c.id === transaction.client_id);
      const property = properties.find(p => p.id === transaction.property_id);
      setSelectedClientId(client?.id || '');
      setSelectedPropertyId(property?.id || '');
    } else {
      setSelectedTransaction({
        id: '',
        client_id: '',
        property_id: '',
        valeur: 0,
        etape: 'prospect',
        agent: '',
        date_creation: new Date().toISOString().split('T')[0],
        derniere_activite: new Date().toISOString().split('T')[0],
        notes: '',
        created_at: '',
        updated_at: ''
      });
      setSelectedClientId('');
      setSelectedPropertyId('');
    }
    setIsDialogOpen(true);
  };

  const handleSaveTransaction = async (transactionData: any) => {
    try {
      if (selectedTransaction?.id) {
        const { error } = await supabase
          .from('transactions')
          .update(transactionData)
          .eq('id', selectedTransaction.id);

        if (error) throw error;
        toast({
          title: "Succès",
          description: "Transaction mise à jour avec succès"
        });
      } else {
        const { error } = await supabase
          .from('transactions')
          .insert([transactionData]);

        if (error) throw error;
        toast({
          title: "Succès",
          description: "Transaction créée avec succès"
        });
      }

      setIsDialogOpen(false);
      fetchTransactions();
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la transaction",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="p-6">Chargement des transactions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Suivi des Ventes</h1>
        <Button onClick={() => openTransactionDialog()} className="bg-primary hover:bg-primary/90">
          Nouvelle Transaction
        </Button>
      </div>

      <PipelineMetrics transactions={transactions} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {etapes.map((etape) => (
          <PipelineStage
            key={etape.key}
            etape={etape}
            transactions={transactions}
            clients={clients}
            properties={properties}
            onTransactionClick={openTransactionDialog}
          />
        ))}
      </div>

      <TransactionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        transaction={selectedTransaction}
        clients={clients}
        properties={properties}
        agents={agents}
        selectedClientId={selectedClientId}
        selectedPropertyId={selectedPropertyId}
        onClientChange={setSelectedClientId}
        onPropertyChange={setSelectedPropertyId}
        onSave={handleSaveTransaction}
      />
    </div>
  );
};

export default Pipeline;
