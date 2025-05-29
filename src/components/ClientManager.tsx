import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ClientStats from './client/ClientStats';
import ClientFilters from './client/ClientFilters';
import ClientCard from './client/ClientCard';
import ClientForm from './client/ClientForm';
import { Client } from './client/types';
import { filterClients } from './client/utils';
import { Card, CardContent } from '@/components/ui/card';
const ClientManager = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('tous');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  const fetchClients = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('clients').select('*').order('created_at', {
        ascending: false
      });
      if (error) throw error;
      setClients((data || []) as Client[]);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les clients",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchClients();
  }, []);
  const filteredClients = filterClients(clients, searchTerm, filterType);
  const openClientDialog = (client?: Client) => {
    setSelectedClient(client || null);
    setIsDialogOpen(true);
  };
  const closeClientDialog = () => {
    setIsDialogOpen(false);
    setSelectedClient(null);
  };
  if (loading) {
    return <div className="p-6">Chargement des clients...</div>;
  }
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-primary">Gestion des Clients</h1>
          <Card>
            
          </Card>
        </div>
        <Button onClick={() => openClientDialog()} className="bg-primary hover:bg-primary/90">
          Nouveau Client
        </Button>
      </div>

      <ClientFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm} filterType={filterType} setFilterType={setFilterType} />

      <ClientStats clients={clients} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map(client => <ClientCard key={client.id} client={client} onClick={() => openClientDialog(client)} />)}
      </div>

      <ClientForm isOpen={isDialogOpen} onClose={closeClientDialog} selectedClient={selectedClient} onSuccess={fetchClients} />
    </div>;
};
export default ClientManager;