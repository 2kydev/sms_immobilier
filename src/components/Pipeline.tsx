
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Transaction, Client, Property, etapes } from './pipeline/types';
import PipelineMetrics from './pipeline/PipelineMetrics';
import PipelineStage from './pipeline/PipelineStage';
import TransactionDialog from './pipeline/TransactionDialog';

const Pipeline = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 1,
      clientNom: 'Martin',
      clientPrenom: 'Jean',
      clientTelephone: '06 12 34 56 78',
      propriete: 'Appartement 3P - République',
      valeur: 425000,
      etape: 'visite',
      agent: 'Marie Dupont',
      dateCreation: '2024-05-15',
      derniereActivite: '2024-05-22',
      notes: 'Client très motivé, recherche activement',
      probabilite: 75
    },
    {
      id: 2,
      clientNom: 'Bernard',
      clientPrenom: 'Sophie',
      clientTelephone: '06 98 76 54 32',
      propriete: 'Maison 5P - Antony',
      valeur: 650000,
      etape: 'negociation',
      agent: 'Pierre Leroy',
      dateCreation: '2024-05-10',
      derniereActivite: '2024-05-23',
      notes: 'Négociation en cours sur le prix',
      probabilite: 60
    },
    {
      id: 3,
      clientNom: 'Dubois',
      clientPrenom: 'Thomas',
      clientTelephone: '06 55 44 33 22',
      propriete: 'Studio - Université',
      valeur: 180000,
      etape: 'prospect',
      agent: 'Marie Dupont',
      dateCreation: '2024-05-20',
      derniereActivite: '2024-05-20',
      notes: 'Premier contact, à relancer',
      probabilite: 25
    }
  ]);

  const [clients, setClients] = useState<Client[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    fetchClients();
    fetchProperties();
  }, []);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, nom, prenom, telephone')
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
        .select('id, titre, prix, adresse')
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

  const openTransactionDialog = (transaction?: Transaction) => {
    if (transaction) {
      setSelectedTransaction(transaction);
      const client = clients.find(c => c.nom === transaction.clientNom && c.prenom === transaction.clientPrenom);
      const property = properties.find(p => p.titre === transaction.propriete);
      setSelectedClientId(client?.id || '');
      setSelectedPropertyId(property?.id || '');
    } else {
      setSelectedTransaction({
        id: 0,
        clientNom: '',
        clientPrenom: '',
        clientTelephone: '',
        propriete: '',
        valeur: 0,
        etape: 'prospect',
        agent: 'Marie Dupont',
        dateCreation: new Date().toISOString().split('T')[0],
        derniereActivite: new Date().toISOString().split('T')[0],
        notes: '',
        probabilite: 25
      });
      setSelectedClientId('');
      setSelectedPropertyId('');
    }
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Pipeline des Transactions</h1>
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
        selectedClientId={selectedClientId}
        selectedPropertyId={selectedPropertyId}
        onClientChange={setSelectedClientId}
        onPropertyChange={setSelectedPropertyId}
      />
    </div>
  );
};

export default Pipeline;
